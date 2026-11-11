import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { workLogSchema } from "@/lib/validators";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const clientId = new URL(req.url).searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

  const client = await prisma.client.findFirst({
    where: { id: clientId, orgId: session.user.orgId },
  });
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const logs = await prisma.workLog.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(logs);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = workLogSchema.parse(await req.json());
    const client = await prisma.client.findFirst({
      where: { id: data.clientId, orgId: session.user.orgId },
    });
    if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const log = await prisma.workLog.create({
      data: {
        clientId: data.clientId,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        title: data.title,
        body: data.body,
        category: data.category,
        hours: data.hours ?? null,
      },
    });
    return NextResponse.json(log);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Invalid" }, { status: 400 });
  }
}
