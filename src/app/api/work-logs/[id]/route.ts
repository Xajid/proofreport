import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { workLogSchema } from "@/lib/validators";
import { apiErrorMessage, parsePeriodDate } from "@/lib/utils";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.workLog.findFirst({
    where: { id, client: { orgId: session.user.orgId } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const data = workLogSchema.partial().parse(await req.json());
    const log = await prisma.workLog.update({
      where: { id },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(data.body ? { body: data.body } : {}),
        ...(data.category ? { category: data.category } : {}),
        ...(data.hours !== undefined ? { hours: data.hours } : {}),
        ...(data.periodStart ? { periodStart: parsePeriodDate(data.periodStart) } : {}),
        ...(data.periodEnd ? { periodEnd: parsePeriodDate(data.periodEnd) } : {}),
      },
    });
    return NextResponse.json(log);
  } catch (e) {
    return NextResponse.json({ error: apiErrorMessage(e) }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.workLog.findFirst({
    where: { id, client: { orgId: session.user.orgId } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.workLog.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
