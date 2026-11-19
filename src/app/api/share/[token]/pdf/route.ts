import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pdfRenderer } from "@/providers/pdf/renderer";
import type { MetricsSnapshot } from "@/types/metrics";
import { getLimits } from "@/lib/plan";
import { liveMentions } from "@/lib/mentions";

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inline = new URL(req.url).searchParams.get("inline") === "1";

  const report = await prisma.reportRun.findUnique({
    where: { shareToken: token },
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

  if (!report || !report.metricsJson || !report.narrative) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const metrics = JSON.parse(report.metricsJson) as MetricsSnapshot;
  const nextActions = report.nextActionsJson
    ? (JSON.parse(report.nextActionsJson) as string[])
    : ["", "", ""];
  const periodLogs = report.client.workLogs.filter(
    (w) => w.periodStart <= report.periodEnd && w.periodEnd >= report.periodStart
  );

  const pastRuns = await prisma.reportRun.findMany({
    where: { clientId: report.clientId, metricsJson: { not: null } },
    orderBy: { periodStart: "asc" },
    take: 6,
  });

  const trendHistory = pastRuns.map((run) => {
    const snap = JSON.parse(run.metricsJson!) as MetricsSnapshot;
    return {
      label: new Date(run.periodStart).toLocaleDateString("en-US", { month: "short" }),
      sessions: snap.organic.sessions,
      clicks: snap.search.clicks,
      conversions: snap.conversions.total,
    };
  });

  const limits = getLimits(report.client.org.plan, report.client.org);
  const shouldWatermark = limits.watermark || Boolean(report.isSample) || Boolean(report.watermark);
  const mentions = liveMentions(report.client.aiMentions);
  const includeAiMentions = limits.aiMentions && report.client.aiMentionsEnabled && mentions.length > 0;

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
    trendHistory,
    workLogs: periodLogs.map((w) => ({
      title: w.title,
      body: w.body,
      category: w.category,
      hours: w.hours,
    })),
    watermark: shouldWatermark,
    includeAiMentions,
    aiMentions: mentions.map((a) => ({
      engine: a.engine,
      prompt: a.prompt,
      mentioned: a.mentioned,
      citations: a.citationsJson ? (JSON.parse(a.citationsJson) as string[]) : [],
    })),
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="report-${report.client.domain}.pdf"`,
    },
  });
}
