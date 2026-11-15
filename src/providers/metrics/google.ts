import { formatISO, subMonths, startOfMonth, endOfMonth } from "date-fns";
import type { MetricsSnapshot } from "@/types/metrics";
import { createMockMetrics } from "./mock";

async function refreshGoogleAccessToken(refreshToken: string): Promise<string | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret || !refreshToken) return null;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { access_token?: string };
  return json.access_token || null;
}

function pctDelta(current: number, previous: number): number {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

async function fetchGa4Report(
  propertyId: string,
  token: string,
  startDate: string,
  endDate: string
) {
  const cleanProp = propertyId.startsWith("properties/") ? propertyId : `properties/${propertyId}`;
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/${cleanProp}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: "sessions" },
          { name: "totalUsers" },
          { name: "screenPageViews" },
          { name: "conversions" },
        ],
        dimensionFilter: {
          filter: {
            fieldName: "sessionDefaultChannelGroup",
            stringFilter: { matchType: "EXACT", value: "Organic Search" },
          },
        },
      }),
    }
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    rows?: { metricValues?: { value?: string }[] }[];
  };
  const vals = data.rows?.[0]?.metricValues;
  if (!vals) return null;
  return {
    sessions: Number(vals[0]?.value || 0),
    users: Number(vals[1]?.value || 0),
    pageviews: Number(vals[2]?.value || 0),
    conversions: Number(vals[3]?.value || 0),
  };
}

async function fetchGscAnalytics(
  siteUrl: string,
  token: string,
  startDate: string,
  endDate: string
) {
  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    siteUrl
  )}/searchAnalytics/query`;

  const [totalsRes, queriesRes] = await Promise.all([
    fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ startDate, endDate, searchType: "web" }),
    }),
    fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ["query"],
        rowLimit: 6,
      }),
    }),
  ]);

  if (!totalsRes.ok) return null;
  const totalsData = (await totalsRes.json()) as {
    rows?: { clicks?: number; impressions?: number; ctr?: number; position?: number }[];
  };
  const queriesData = queriesRes.ok
    ? ((await queriesRes.json()) as {
        rows?: {
          keys?: string[];
          clicks?: number;
          impressions?: number;
          position?: number;
        }[];
      })
    : { rows: [] };

  const row = totalsData.rows?.[0];
  if (!row) return null;

  return {
    clicks: Math.round(row.clicks || 0),
    impressions: Math.round(row.impressions || 0),
    ctr: Number(((row.ctr || 0) * 100).toFixed(2)),
    avgPosition: Number((row.position || 0).toFixed(1)),
    topQueries: (queriesData.rows || []).map((q) => ({
      query: q.keys?.[0] || "(not set)",
      clicks: Math.round(q.clicks || 0),
      impressions: Math.round(q.impressions || 0),
      position: Number((q.position || 0).toFixed(1)),
    })),
  };
}

/**
 * Google Analytics 4 Data API + Search Console API adapter.
 * Uses real Google REST APIs when GOOGLE_CLIENT_ID/SECRET and a real OAuth token
 * are configured; gracefully falls back to deterministic demo snapshots otherwise.
 */
export async function fetchGoogleMetrics(opts: {
  clientDomain: string;
  periodStart: Date;
  periodEnd: Date;
  preferredProvider?: "mock" | "google";
  ga4PropertyId?: string | null;
  gscSiteUrl?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
}): Promise<MetricsSnapshot> {
  const fallback = createMockMetrics(opts.clientDomain, opts.periodStart, opts.periodEnd);

  const isRealToken =
    !!opts.accessToken &&
    opts.accessToken !== "mock-token" &&
    opts.accessToken !== "pending-oauth";

  const hasCreds =
    opts.preferredProvider === "google" &&
    !!process.env.GOOGLE_CLIENT_ID &&
    !!process.env.GOOGLE_CLIENT_SECRET &&
    isRealToken;

  if (!hasCreds) {
    return { ...fallback, provider: "mock" };
  }

  let token = opts.accessToken!;
  if (opts.refreshToken) {
    const refreshed = await refreshGoogleAccessToken(opts.refreshToken);
    if (refreshed) token = refreshed;
  }

  const startStr = formatISO(opts.periodStart, { representation: "date" });
  const endStr = formatISO(opts.periodEnd, { representation: "date" });
  const prevStart = startOfMonth(subMonths(opts.periodStart, 1));
  const prevEnd = endOfMonth(subMonths(opts.periodStart, 1));
  const prevStartStr = formatISO(prevStart, { representation: "date" });
  const prevEndStr = formatISO(prevEnd, { representation: "date" });

  try {
    const [gaCur, gaPrev, gscCur, gscPrev] = await Promise.all([
      opts.ga4PropertyId ? fetchGa4Report(opts.ga4PropertyId, token, startStr, endStr) : null,
      opts.ga4PropertyId ? fetchGa4Report(opts.ga4PropertyId, token, prevStartStr, prevEndStr) : null,
      opts.gscSiteUrl ? fetchGscAnalytics(opts.gscSiteUrl, token, startStr, endStr) : null,
      opts.gscSiteUrl ? fetchGscAnalytics(opts.gscSiteUrl, token, prevStartStr, prevEndStr) : null,
    ]);

    if (!gaCur && !gscCur) {
      return { ...fallback, provider: "google" };
    }

    const sessions = gaCur?.sessions ?? fallback.organic.sessions;
    const convTotal = gaCur?.conversions ?? fallback.conversions.total;
    const rate = sessions > 0 ? Number(((convTotal / sessions) * 100).toFixed(2)) : fallback.conversions.rate;
    const prevRate =
      gaPrev && gaPrev.sessions > 0
        ? (gaPrev.conversions / gaPrev.sessions) * 100
        : rate;

    return {
      provider: "google",
      periodStart: opts.periodStart.toISOString(),
      periodEnd: opts.periodEnd.toISOString(),
      previousPeriodStart: prevStart.toISOString(),
      previousPeriodEnd: prevEnd.toISOString(),
      organic: gaCur
        ? {
            sessions: gaCur.sessions,
            sessionsDeltaPct: gaPrev ? pctDelta(gaCur.sessions, gaPrev.sessions) : 0,
            users: gaCur.users,
            usersDeltaPct: gaPrev ? pctDelta(gaCur.users, gaPrev.users) : 0,
            pageviews: gaCur.pageviews,
            pageviewsDeltaPct: gaPrev ? pctDelta(gaCur.pageviews, gaPrev.pageviews) : 0,
          }
        : fallback.organic,
      search: gscCur
        ? {
            clicks: gscCur.clicks,
            clicksDeltaPct: gscPrev ? pctDelta(gscCur.clicks, gscPrev.clicks) : 0,
            impressions: gscCur.impressions,
            impressionsDeltaPct: gscPrev ? pctDelta(gscCur.impressions, gscPrev.impressions) : 0,
            ctr: gscCur.ctr,
            ctrDeltaPct: gscPrev ? pctDelta(gscCur.ctr, gscPrev.ctr) : 0,
            avgPosition: gscCur.avgPosition,
            avgPositionDelta: gscPrev
              ? Number((gscCur.avgPosition - gscPrev.avgPosition).toFixed(1))
              : 0,
            topQueries: gscCur.topQueries.length ? gscCur.topQueries : fallback.search.topQueries,
          }
        : fallback.search,
      conversions: gaCur
        ? {
            total: convTotal,
            totalDeltaPct: gaPrev ? pctDelta(convTotal, gaPrev.conversions) : 0,
            rate,
            rateDeltaPct: pctDelta(rate, prevRate),
            goals: fallback.conversions.goals,
          }
        : fallback.conversions,
    };
  } catch {
    return { ...fallback, provider: "google" };
  }
}
