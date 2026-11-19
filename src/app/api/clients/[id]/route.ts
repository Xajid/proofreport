import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clientSchema } from "@/lib/validators";
import { apiErrorMessage } from "@/lib/utils";
import { getLimits } from "@/lib/plan";

async function assertClient(orgId: string, id: string) {
  return prisma.client.findFirst({
    where: { id, orgId },
    include: {
      connections: true,
      workLogs: { orderBy: { createdAt: "desc" } },
      reportRuns: { orderBy: { createdAt: "desc" } },
      aiMentions: { orderBy: { checkedAt: "desc" } },
    },
  });
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const client = await assertClient(session.user.orgId, id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    ...client,
    connections: client.connections.map((row) => ({
      id: row.id,
      clientId: row.clientId,
      type: row.type,
      provider: row.provider,
      externalId: row.externalId,
      displayName: row.displayName,
      metaJson: row.metaJson,
      connectedAt: row.connectedAt,
      updatedAt: row.updatedAt,
    })),
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const existing = await assertClient(session.user.orgId, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const data = clientSchema.partial().parse(await req.json());
    if (data.aiMentionsEnabled) {
      const org = await prisma.organization.findUnique({
        where: { id: session.user.orgId },
        select: { plan: true },
      });
      const limits = getLimits(org?.plan);
      if (!limits.aiMentions) {
        return NextResponse.json(
          {
            error: "AI Mentions (AEO visibility) requires an upgraded plan.",
            code: "PLAN_LIMIT",
            plan: org?.plan,
          },
          { status: 403 }
        );
      }
    }
    const client = await prisma.client.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.domain
          ? { domain: data.domain.replace(/^https?:\/\//, "").replace(/\/$/, "") }
          : {}),
        ...(data.contactEmail !== undefined ? { contactEmail: data.contactEmail || null } : {}),
        ...(data.aiMentionsEnabled !== undefined
          ? { aiMentionsEnabled: data.aiMentionsEnabled }
          : {}),
      },
    });
    return NextResponse.json(client);
  } catch (e) {
    return NextResponse.json({ error: apiErrorMessage(e) }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const existing = await assertClient(session.user.orgId, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.client.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
