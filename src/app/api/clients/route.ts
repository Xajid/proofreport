import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clientSchema } from "@/lib/validators";

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
  try {
    const data = clientSchema.parse(await req.json());
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
    return NextResponse.json({ error: e instanceof Error ? e.message : "Invalid" }, { status: 400 });
  }
}
