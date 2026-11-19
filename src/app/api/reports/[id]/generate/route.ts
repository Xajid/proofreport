import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyRefreshedTokens, googleSources, metricsProvider } from "@/providers/metrics";
import { narrativeProvider } from "@/providers/narrative";
import { periodLabel } from "@/lib/utils";
import { getLimits, trialEndedMessage } from "@/lib/plan";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const report = await prisma.reportRun.findFirst({
    where: { id, client: { orgId: session.user.orgId } },
    include: {
      client: {
        include: { connections: true, org: true, workLogs: true },
      },
    },
  });
  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const org = report.client.org;
  const limits = getLimits(org.plan, org);
  if (limits.expired) {
    return NextResponse.json({ error: trialEndedMessage(), code: "TRIAL_ENDED" }, { status: 403 });
  }

  const previousStatus = report.status === "generating" ? "draft" : report.status;
  await prisma.reportRun.update({ where: { id }, data: { status: "generating" } });

  const sources = googleSources(report.client.connections);
  const fetched = await metricsProvider.fetch({
    clientDomain: report.client.domain,
    periodStart: report.periodStart,
    periodEnd: report.periodEnd,
    preferredProvider: sources.preferredProvider,
    ga4: sources.ga4,
    gsc: sources.gsc,
  });

  if (!fetched.ok) {
    await prisma.reportRun.update({ where: { id }, data: { status: previousStatus } });
    return NextResponse.json({ error: fetched.error, source: fetched.source }, { status: 422 });
  }

  await applyRefreshedTokens(fetched.refreshed);

  const periodLogs = report.client.workLogs.filter((w) => {
    return w.periodStart <= report.periodEnd && w.periodEnd >= report.periodStart;
  });

  const narrative = await narrativeProvider.generate({
    clientName: report.client.name,
    agencyName: org.name,
    periodLabel: periodLabel(report.periodStart, report.periodEnd),
    metrics: fetched.metrics,
    workLogs: periodLogs.map((w) => ({
      title: w.title,
      body: w.body,
      category: w.category,
      hours: w.hours,
    })),
  });

  const updated = await prisma.reportRun.update({
    where: { id },
    data: {
      status: "draft",
      metricsJson: JSON.stringify(fetched.metrics),
      narrative: narrative.narrative,
      narrativeSource: narrative.source,
      nextActionsJson: JSON.stringify(narrative.nextActions),
      watermark: limits.watermark,
    },
  });

  return NextResponse.json({
    ...updated,
    narrativeSource: narrative.source,
  });
}
