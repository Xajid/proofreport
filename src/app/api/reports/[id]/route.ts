import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reportUpdateSchema } from "@/lib/validators";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const report = await prisma.reportRun.findFirst({
    where: { id, client: { orgId: session.user.orgId } },
    include: {
      client: {
        include: {
          connections: true,
          org: true,
          aiMentions: { orderBy: { checkedAt: "desc" }, take: 10 },
        },
      },
    },
  });
  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(report);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.reportRun.findFirst({
    where: { id, client: { orgId: session.user.orgId } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const data = reportUpdateSchema.parse(await req.json());
    const report = await prisma.reportRun.update({
      where: { id },
      data: {
        ...(data.narrative !== undefined ? { narrative: data.narrative } : {}),
        ...(data.nextActions ? { nextActionsJson: JSON.stringify(data.nextActions) } : {}),
        ...(data.status ? { status: data.status } : {}),
      },
    });
    return NextResponse.json(report);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Invalid" }, { status: 400 });
  }
}
