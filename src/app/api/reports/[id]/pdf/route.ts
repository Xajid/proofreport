import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pdfRenderer } from "@/providers/pdf/renderer";
import type { MetricsSnapshot } from "@/types/metrics";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const report = await prisma.reportRun.findFirst({
    where: { id, client: { orgId: session.user.orgId } },
    include: {
      client: {
        include: {
          org: true,
          workLogs: true,
          aiMentions: { orderBy: { checkedAt: "desc" }, take: 10 },
        },
      },
    },
  });
  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!report.metricsJson || !report.narrative) {
    return NextResponse.json({ error: "Generate report first" }, { status: 400 });
  }

  const metrics = JSON.parse(report.metricsJson) as MetricsSnapshot;
  const nextActions = report.nextActionsJson
    ? (JSON.parse(report.nextActionsJson) as string[])
    : ["", "", ""];

  const periodLogs = report.client.workLogs.filter(
    (w) => w.periodStart <= report.periodEnd && w.periodEnd >= report.periodStart
  );

  const buffer = await pdfRenderer.render({
    agencyName: report.client.org.name,
    logoUrl: report.client.org.logoUrl,
    primaryColor: report.client.org.primaryColor,
    clientName: report.client.name,
    clientDomain: report.client.domain,
    periodStart: report.periodStart.toISOString(),
    periodEnd: report.periodEnd.toISOString(),
    narrative: report.narrative,
    nextActions,
    metrics,
    workLogs: periodLogs.map((w) => ({
      title: w.title,
      body: w.body,
      category: w.category,
    })),
    watermark: report.watermark || report.isSample,
    includeAiMentions: report.client.aiMentionsEnabled,
    aiMentions: report.client.aiMentions.map((a) => ({
      engine: a.engine,
      prompt: a.prompt,
      mentioned: a.mentioned,
      citations: a.citationsJson ? (JSON.parse(a.citationsJson) as string[]) : [],
    })),
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="report-${report.client.domain}-${id}.pdf"`,
    },
  });
}
