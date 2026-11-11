import { subMonths, formatISO, startOfMonth, endOfMonth } from "date-fns";
import type { MetricsSnapshot } from "@/types/metrics";

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h || 1;
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createMockMetrics(
  clientDomain: string,
  periodStart: Date,
  periodEnd: Date
): MetricsSnapshot {
  const rnd = mulberry32(hashSeed(`${clientDomain}-${formatISO(periodStart, { representation: "date" })}`));
  const baseSessions = 1800 + Math.floor(rnd() * 4200);
  const sessionsDelta = -8 + rnd() * 28;
  const clicks = 900 + Math.floor(rnd() * 2500);
  const clicksDelta = -5 + rnd() * 24;
  const impressions = clicks * (12 + rnd() * 18);
  const conversions = 18 + Math.floor(rnd() * 60);
  const convDelta = -10 + rnd() * 35;

  const prevStart = startOfMonth(subMonths(periodStart, 1));
  const prevEnd = endOfMonth(subMonths(periodStart, 1));

  const queries = [
    "best plumber near me",
    "emergency roof repair",
    "local seo agency",
    "how to choose hvac",
    "same day locksmith",
  ].map((query, i) => ({
    query: query.includes("seo") ? `${clientDomain.split(".")[0]} ${query}` : query,
    clicks: Math.floor(clicks * (0.18 - i * 0.03) * (0.8 + rnd())),
    impressions: Math.floor(impressions * (0.12 - i * 0.015)),
    position: 4 + i * 1.4 + rnd() * 2,
  }));

  return {
    provider: "mock",
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    previousPeriodStart: prevStart.toISOString(),
    previousPeriodEnd: prevEnd.toISOString(),
    organic: {
      sessions: baseSessions,
      sessionsDeltaPct: Number(sessionsDelta.toFixed(1)),
      users: Math.floor(baseSessions * 0.78),
      usersDeltaPct: Number((sessionsDelta - 1.2).toFixed(1)),
      pageviews: Math.floor(baseSessions * (1.8 + rnd())),
      pageviewsDeltaPct: Number((sessionsDelta + 2.1).toFixed(1)),
    },
    search: {
      clicks,
      clicksDeltaPct: Number(clicksDelta.toFixed(1)),
      impressions: Math.floor(impressions),
      impressionsDeltaPct: Number((clicksDelta + 3).toFixed(1)),
      ctr: Number(((clicks / impressions) * 100).toFixed(2)),
      ctrDeltaPct: Number((rnd() * 10 - 2).toFixed(1)),
      avgPosition: Number((12 + rnd() * 8).toFixed(1)),
      avgPositionDelta: Number((rnd() * 2 - 1.2).toFixed(1)),
      topQueries: queries,
    },
    conversions: {
      total: conversions,
      totalDeltaPct: Number(convDelta.toFixed(1)),
      rate: Number(((conversions / baseSessions) * 100).toFixed(2)),
      rateDeltaPct: Number((convDelta / 2).toFixed(1)),
      goals: [
        { name: "Contact form", count: Math.floor(conversions * 0.55), deltaPct: Number((convDelta + 2).toFixed(1)) },
        { name: "Phone click", count: Math.floor(conversions * 0.3), deltaPct: Number((convDelta - 3).toFixed(1)) },
        { name: "Quote request", count: Math.floor(conversions * 0.15), deltaPct: Number((convDelta + 5).toFixed(1)) },
      ],
    },
  };
}
