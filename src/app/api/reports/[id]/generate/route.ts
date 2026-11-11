import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { metricsProvider } from "@/providers/metrics";
import { narrativeProvider } from "@/providers/narrative";
import { periodLabel } from "@/lib/utils";

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

  await prisma.reportRun.update({ where: { id }, data: { status: "generating" } });

  const ga4 = report.client.connections.find((c) => c.type === "ga4");
  const gsc = report.client.connections.find((c) => c.type === "gsc");
  const preferred =
    ga4?.provider === "google" || gsc?.provider === "google" ? "google" : "mock";

  const metrics = await metricsProvider.fetch({
    clientDomain: report.client.domain,
    periodStart: report.periodStart,
    periodEnd: report.periodEnd,
    preferredProvider: preferred,
    ga4PropertyId: ga4?.externalId,
    gscSiteUrl: gsc?.externalId,
    accessToken: ga4?.accessToken || gsc?.accessToken,
  });

  const periodLogs = report.client.workLogs.filter((w) => {
    return w.periodStart <= report.periodEnd && w.periodEnd >= report.periodStart;
  });

  const narrative = await narrativeProvider.generate({
    clientName: report.client.name,
    agencyName: report.client.org.name,
    periodLabel: periodLabel(report.periodStart, report.periodEnd),
    metrics,
    workLogs: periodLogs.map((w) => ({
      title: w.title,
      body: w.body,
      category: w.category,
    })),
  });

  const updated = await prisma.reportRun.update({
    where: { id },
    data: {
      status: "ready",
      metricsJson: JSON.stringify(metrics),
      narrative: narrative.narrative,
      nextActionsJson: JSON.stringify(narrative.nextActions),
    },
  });

  return NextResponse.json({
    ...updated,
    narrativeSource: narrative.source,
  });
}
