import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { prisma } from "@/lib/prisma";
import { applyRefreshedTokens, googleSources, metricsProvider } from "@/providers/metrics";
import { narrativeProvider } from "@/providers/narrative";
import { periodLabel } from "@/lib/utils";
import { getLimits } from "@/lib/plan";

async function run(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
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
  let failed = 0;

  for (const org of orgs) {
    const limits = getLimits(org.plan, org);
    if (!limits.cronScheduled || limits.expired) continue;

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

      const sources = googleSources(client.connections);
      const fetched = await metricsProvider.fetch({
        clientDomain: client.domain,
        periodStart,
        periodEnd,
        preferredProvider: sources.preferredProvider,
        ga4: sources.ga4,
        gsc: sources.gsc,
      });

      if (!fetched.ok) {
        failed++;
        continue;
      }

      await applyRefreshedTokens(fetched.refreshed);

      const periodLogs = client.workLogs.filter(
        (w) => w.periodStart <= periodEnd && w.periodEnd >= periodStart
      );

      const narrative = await narrativeProvider.generate({
        clientName: client.name,
        agencyName: org.name,
        periodLabel: periodLabel(periodStart, periodEnd),
        metrics: fetched.metrics,
        workLogs: periodLogs.map((w) => ({
          title: w.title,
          body: w.body,
          category: w.category,
          hours: w.hours,
        })),
      });

      await prisma.reportRun.create({
        data: {
          clientId: client.id,
          periodStart,
          periodEnd,
          status: "draft",
          watermark: limits.watermark,
          metricsJson: JSON.stringify(fetched.metrics),
          narrative: narrative.narrative,
          narrativeSource: narrative.source,
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
    failed,
  });
}

export async function GET(req: Request) {
  return run(req);
}

export async function POST(req: Request) {
  return run(req);
}
