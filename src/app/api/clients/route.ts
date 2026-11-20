import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clientSchema } from "@/lib/validators";
import { apiErrorMessage } from "@/lib/utils";
import { clientSlotsUsed, getLimits, holdsClientSlot, trialEndedMessage } from "@/lib/plan";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const clients = await prisma.client.findMany({
    where: { orgId: session.user.orgId },
    include: {
      connections: true,
      _count: { select: { workLogs: true, reportRuns: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = session.user.orgId;
  let payload: ReturnType<typeof clientSchema.parse>;
  try {
    payload = clientSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: apiErrorMessage(e) }, { status: 400 });
  }

  try {
    const client = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Organization" WHERE id = ${orgId} FOR UPDATE`;
      const org = await tx.organization.findUnique({ where: { id: orgId } });
      const limits = getLimits(org?.plan, org);
      if (limits.expired) {
        return { error: trialEndedMessage(), code: "TRIAL_ENDED" as const, status: 403 as const };
      }
      const liveCount = await tx.client.count({ where: { orgId } });
      const used = clientSlotsUsed(org?.plan, liveCount, org?.clientsCreated ?? 0);
      if (used >= limits.maxClients) {
        return {
          error: "Client limit reached for your plan. Upgrade to add more clients.",
          code: "PLAN_LIMIT" as const,
          plan: org?.plan,
          status: 403 as const,
        };
      }
      if (payload.aiMentionsEnabled && !limits.aiMentions) {
        return {
          error: "AI Mentions (AEO visibility) requires an upgraded plan.",
          code: "PLAN_LIMIT" as const,
          plan: org?.plan,
          status: 403 as const,
        };
      }
      const created = await tx.client.create({
        data: {
          orgId,
          name: payload.name,
          domain: payload.domain.replace(/^https?:\/\//, "").replace(/\/$/, ""),
          contactEmail: payload.contactEmail || null,
          aiMentionsEnabled: payload.aiMentionsEnabled ?? false,
        },
      });
      if (holdsClientSlot(org?.plan)) {
        await tx.organization.update({
          where: { id: orgId },
          data: { clientsCreated: Math.max(org?.clientsCreated ?? 0, liveCount) + 1 },
        });
      }
      return { client: created };
    });
    if ("error" in client && client.error) {
      return NextResponse.json(
        { error: client.error, code: client.code, plan: "plan" in client ? client.plan : undefined },
        { status: client.status }
      );
    }
    return NextResponse.json("client" in client ? client.client : client);
  } catch (e) {
    return NextResponse.json({ error: apiErrorMessage(e) }, { status: 400 });
  }
}
