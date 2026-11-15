import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reportCreateSchema } from "@/lib/validators";
import { apiErrorMessage, parsePeriodDate } from "@/lib/utils";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const clientId = new URL(req.url).searchParams.get("clientId");
  const reports = await prisma.reportRun.findMany({
    where: {
      client: { orgId: session.user.orgId },
      ...(clientId ? { clientId } : {}),
    },
    include: { client: { select: { name: true, domain: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(reports);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = reportCreateSchema.parse(await req.json());
    const client = await prisma.client.findFirst({
      where: { id: data.clientId, orgId: session.user.orgId },
    });
    if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const report = await prisma.reportRun.create({
      data: {
        clientId: data.clientId,
        periodStart: parsePeriodDate(data.periodStart),
        periodEnd: parsePeriodDate(data.periodEnd),
        status: "draft",
        isSample: data.isSample ?? false,
        watermark: data.isSample ?? false,
      },
    });
    return NextResponse.json(report);
  } catch (e) {
    return NextResponse.json({ error: apiErrorMessage(e) }, { status: 400 });
  }
}
