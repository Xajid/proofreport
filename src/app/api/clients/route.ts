import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clientSchema } from "@/lib/validators";
import { apiErrorMessage } from "@/lib/utils";
import { getLimits } from "@/lib/plan";

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

  const org = await prisma.organization.findUnique({ where: { id: session.user.orgId } });
  const limits = getLimits(org?.plan ?? "trial");
  const currentCount = await prisma.client.count({ where: { orgId: session.user.orgId } });
  if (currentCount >= limits.maxClients) {
    return NextResponse.json({
      error: "Client limit reached for your plan. Upgrade to add more clients.",
      code: "PLAN_LIMIT",
      plan: org?.plan,
    }, { status: 403 });
  }

  try {
    const data = clientSchema.parse(await req.json());
    if (data.aiMentionsEnabled && !limits.aiMentions) {
      return NextResponse.json({
        error: "AI Mentions (AEO visibility) requires an upgraded plan.",
        code: "PLAN_LIMIT",
        plan: org?.plan,
      }, { status: 403 });
    }
    const client = await prisma.client.create({
      data: {
        orgId: session.user.orgId,
        name: data.name,
        domain: data.domain.replace(/^https?:\/\//, "").replace(/\/$/, ""),
        contactEmail: data.contactEmail || null,
        aiMentionsEnabled: data.aiMentionsEnabled ?? false,
      },
    });
    return NextResponse.json(client);
  } catch (e) {
    return NextResponse.json({ error: apiErrorMessage(e) }, { status: 400 });
  }
}
