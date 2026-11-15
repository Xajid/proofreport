import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nanoid } from "nanoid";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const report = await prisma.reportRun.findFirst({
    where: { id, client: { orgId: session.user.orgId } },
  });
  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const shareToken = report.shareToken || nanoid(18);
  if (!report.shareToken) {
    await prisma.reportRun.update({ where: { id }, data: { shareToken } });
  }

  const origin = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return NextResponse.json({
    shareToken,
    shareUrl: `${origin}/share/${shareToken}`,
  });
}

