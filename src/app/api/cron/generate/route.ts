import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { prisma } from "@/lib/prisma";
import { metricsProvider } from "@/providers/metrics";
import { narrativeProvider } from "@/providers/narrative";
import { periodLabel } from "@/lib/utils";
import { getLimits } from "@/lib/plan";

export async function POST(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const force = new URL(req.url).searchParams.get("force") === "1";
  const todayDay = new Date().getUTCDate();

  const orgs = await prisma.organization.findMany({
    where: force ? undefined : { scheduleDay: todayDay },
    include: {
      clients: {
        include: { connections: true, workLogs: true },
      },
    },
  });

  const now = new Date();
  const periodStart = startOfMonth(subMonths(now, 1));
  const periodEnd = endOfMonth(subMonths(now, 1));

  let created = 0;
  let skipped = 0;

  for (const org of orgs) {
    const limits = getLimits(org.plan);
    if (!force && !limits.cronScheduled) {
      // Automatic monthly background cron is an Agency feature
      continue;
    }

    for (const client of org.clients) {
      const existing = await prisma.reportRun.findFirst({
        where: {
          clientId: client.id,
          periodStart: { gte: startOfMonth(periodStart) },
          periodEnd: { lte: endOfMonth(periodEnd) },
        },
      });
      if (existing) {
        skipped++;
        continue;
      }

      const ga4 = client.connections.find((c) => c.type === "ga4");
      const gsc = client.connections.find((c) => c.type === "gsc");
      const preferred =
        ga4?.provider === "google" || gsc?.provider === "google" ? "google" : "mock";

      const metrics = await metricsProvider.fetch({
        clientDomain: client.domain,
        periodStart,
        periodEnd,
        preferredProvider: preferred,
        ga4PropertyId: ga4?.externalId,
        gscSiteUrl: gsc?.externalId,
        accessToken: ga4?.accessToken || gsc?.accessToken,
        refreshToken: ga4?.refreshToken || gsc?.refreshToken,
      });

      const periodLogs = client.workLogs.filter(
        (w) => w.periodStart <= periodEnd && w.periodEnd >= periodStart
      );

      const narrative = await narrativeProvider.generate({
        clientName: client.name,
        agencyName: org.name,
        periodLabel: periodLabel(periodStart, periodEnd),
        metrics,
        workLogs: periodLogs.map((w) => ({
          title: w.title,
          body: w.body,
          category: w.category,
        })),
      });

      await prisma.reportRun.create({
        data: {
          clientId: client.id,
          periodStart,
          periodEnd,
          status: "ready",
          watermark: limits.watermark,
          metricsJson: JSON.stringify(metrics),
          narrative: narrative.narrative,
          nextActionsJson: JSON.stringify(narrative.nextActions),
        },
      });
      created++;
    }
  }

  return NextResponse.json({
    ok: true,
    day: todayDay,
    orgsMatched: orgs.length,
    created,
    skipped,
  });
}

