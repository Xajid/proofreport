import { formatISO } from "date-fns";
import type { MetricsSnapshot } from "@/types/metrics";
import { previousPeriod } from "@/lib/utils";

export type ConnectedSource = {
  connectionId: string;
  externalId: string | null;
  accessToken: string | null;
  refreshToken: string | null;
};

export type RefreshedToken = { connectionId: string; accessToken: string };

export type MetricsFetchResult =
  | { ok: true; metrics: MetricsSnapshot; refreshed: RefreshedToken[] }
  | { ok: false; error: string; source: "ga4" | "gsc" | "config" };

type Ga4Totals = {
  sessions: number;
  users: number;
  pageviews: number;
  conversions: number;
};

const ORGANIC_FILTER = {
  filter: {
    fieldName: "sessionDefaultChannelGroup",
    stringFilter: { matchType: "EXACT", value: "Organic Search" },
  },
};

function pctDelta(current: number, previous: number): number {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function day(date: Date): string {
  return formatISO(date, { representation: "date" });
}

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

function usableStoredToken(token: string | null | undefined): string | null {
  if (!token || token === "mock-token" || token === "pending-oauth") return null;
  return token;
}

async function tokenFor(source: ConnectedSource): Promise<
  | { ok: true; token: string; refreshed: string | null }
  | { ok: false; error: string }
> {
  const refreshed = source.refreshToken ? await refreshGoogleAccessToken(source.refreshToken) : null;
  if (refreshed) return { ok: true, token: refreshed, refreshed };
  const stored = usableStoredToken(source.accessToken);
  if (stored) return { ok: true, token: stored, refreshed: null };
  return { ok: false, error: "Google access expired. Reconnect this property and try again." };
}

async function ga4Post(propertyId: string, token: string, body: unknown) {
  const cleanProp = propertyId.startsWith("properties/") ? propertyId : `properties/${propertyId}`;
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/${cleanProp}:runReport`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) return { ok: false as const, status: res.status };
  return { ok: true as const, data: (await res.json()) as Record<string, unknown> };
}

async function fetchGa4Totals(
  propertyId: string,
  token: string,
  startDate: string,
  endDate: string
): Promise<{ ok: true; data: Ga4Totals } | { ok: false; error: string }> {
  const res = await ga4Post(propertyId, token, {
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: "sessions" },
      { name: "totalUsers" },
      { name: "screenPageViews" },
      { name: "conversions" },
    ],
    dimensionFilter: ORGANIC_FILTER,
  });
  if (!res.ok) return { ok: false, error: `Google Analytics request failed (${res.status}).` };
  const rows = (res.data.rows as { metricValues?: { value?: string }[] }[] | undefined) ?? [];
  const vals = rows[0]?.metricValues;
  return {
    ok: true,
    data: {
      sessions: Number(vals?.[0]?.value || 0),
      users: Number(vals?.[1]?.value || 0),
      pageviews: Number(vals?.[2]?.value || 0),
      conversions: Number(vals?.[3]?.value || 0),
    },
  };
}

async function fetchLandingPages(propertyId: string, token: string, startDate: string, endDate: string) {
  const res = await ga4Post(propertyId, token, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "landingPagePlusQueryString" }],
    metrics: [{ name: "sessions" }],
    dimensionFilter: ORGANIC_FILTER,
    limit: 8,
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
  });
  if (!res.ok) return [];
  const rows =
    (res.data.rows as { dimensionValues?: { value?: string }[]; metricValues?: { value?: string }[] }[] | undefined) ??
    [];
  return rows.map((row) => ({
    path: row.dimensionValues?.[0]?.value || "(not set)",
    sessions: Number(row.metricValues?.[0]?.value || 0),
  }));
}

async function fetchGoalCounts(propertyId: string, token: string, startDate: string, endDate: string) {
  const res = await ga4Post(propertyId, token, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "eventName" }],
    metrics: [{ name: "conversions" }],
    dimensionFilter: ORGANIC_FILTER,
    limit: 8,
    orderBys: [{ metric: { metricName: "conversions" }, desc: true }],
  });
  if (!res.ok) return [];
  const rows =
    (res.data.rows as { dimensionValues?: { value?: string }[]; metricValues?: { value?: string }[] }[] | undefined) ??
    [];
  return rows
    .map((row) => ({
      name: row.dimensionValues?.[0]?.value || "(not set)",
      count: Number(row.metricValues?.[0]?.value || 0),
    }))
    .filter((row) => row.count > 0);
}

type GscTotals = {
  clicks: number;
  impressions: number;
  ctr: number;
  avgPosition: number;
  topQueries: { query: string; clicks: number; impressions: number; position: number }[];
};

async function fetchGscAnalytics(
  siteUrl: string,
  token: string,
  startDate: string,
  endDate: string
): Promise<{ ok: true; data: GscTotals } | { ok: false; error: string }> {
  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const [totalsRes, queriesRes] = await Promise.all([
    fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ startDate, endDate, searchType: "web" }),
    }),
    fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ startDate, endDate, dimensions: ["query"], rowLimit: 6, searchType: "web" }),
    }),
  ]);

  if (!totalsRes.ok) {
    return { ok: false, error: `Search Console request failed (${totalsRes.status}).` };
  }

  const totalsData = (await totalsRes.json()) as {
    rows?: { clicks?: number; impressions?: number; ctr?: number; position?: number }[];
  };
  const queriesData = queriesRes.ok
    ? ((await queriesRes.json()) as {
        rows?: { keys?: string[]; clicks?: number; impressions?: number; position?: number }[];
      })
    : { rows: [] };

  const row = totalsData.rows?.[0];
  return {
    ok: true,
    data: {
      clicks: Math.round(row?.clicks || 0),
      impressions: Math.round(row?.impressions || 0),
      ctr: Number(((row?.ctr || 0) * 100).toFixed(2)),
      avgPosition: Number((row?.position || 0).toFixed(1)),
      topQueries: (queriesData.rows || []).map((q) => ({
        query: q.keys?.[0] || "(not set)",
        clicks: Math.round(q.clicks || 0),
        impressions: Math.round(q.impressions || 0),
        position: Number((q.position || 0).toFixed(1)),
      })),
    },
  };
}

/**
 * Live GA4 + Search Console numbers only. A failed or missing property returns an error.
 * Demo snapshots are never substituted into a report marked live.
 */
export async function fetchGoogleMetrics(opts: {
  periodStart: Date;
  periodEnd: Date;
  ga4?: ConnectedSource | null;
  gsc?: ConnectedSource | null;
}): Promise<MetricsFetchResult> {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return { ok: false, source: "config", error: "Google OAuth is not configured on this server." };
  }
  if (!opts.ga4 && !opts.gsc) {
    return { ok: false, source: "config", error: "Connect Google Analytics or Search Console before generating." };
  }
  if (opts.ga4 && !opts.ga4.externalId) {
    return { ok: false, source: "ga4", error: "Select a GA4 property before generating this report." };
  }
  if (opts.gsc && !opts.gsc.externalId) {
    return { ok: false, source: "gsc", error: "Select a Search Console property before generating this report." };
  }

  const refreshed: RefreshedToken[] = [];
  let ga4Token: string | null = null;
  let gscToken: string | null = null;

  if (opts.ga4) {
    const token = await tokenFor(opts.ga4);
    if (!token.ok) return { ok: false, source: "ga4", error: `Google Analytics: ${token.error}` };
    ga4Token = token.token;
    if (token.refreshed) refreshed.push({ connectionId: opts.ga4.connectionId, accessToken: token.refreshed });
  }
  if (opts.gsc) {
    const token = await tokenFor(opts.gsc);
    if (!token.ok) return { ok: false, source: "gsc", error: `Search Console: ${token.error}` };
    gscToken = token.token;
    if (token.refreshed) refreshed.push({ connectionId: opts.gsc.connectionId, accessToken: token.refreshed });
  }

  const startStr = day(opts.periodStart);
  const endStr = day(opts.periodEnd);
  const { prevStart, prevEnd } = previousPeriod(opts.periodStart, opts.periodEnd);
  const prevStartStr = day(prevStart);
  const prevEndStr = day(prevEnd);

  try {
    const [gaCur, gaPrev, pages, goalsCur, goalsPrev, gscCur, gscPrev] = await Promise.all([
      opts.ga4 && ga4Token ? fetchGa4Totals(opts.ga4.externalId!, ga4Token, startStr, endStr) : null,
      opts.ga4 && ga4Token ? fetchGa4Totals(opts.ga4.externalId!, ga4Token, prevStartStr, prevEndStr) : null,
      opts.ga4 && ga4Token ? fetchLandingPages(opts.ga4.externalId!, ga4Token, startStr, endStr) : [],
      opts.ga4 && ga4Token ? fetchGoalCounts(opts.ga4.externalId!, ga4Token, startStr, endStr) : [],
      opts.ga4 && ga4Token ? fetchGoalCounts(opts.ga4.externalId!, ga4Token, prevStartStr, prevEndStr) : [],
      opts.gsc && gscToken ? fetchGscAnalytics(opts.gsc.externalId!, gscToken, startStr, endStr) : null,
      opts.gsc && gscToken ? fetchGscAnalytics(opts.gsc.externalId!, gscToken, prevStartStr, prevEndStr) : null,
    ]);

    if (gaCur && !gaCur.ok) return { ok: false, source: "ga4", error: gaCur.error };
    if (gaPrev && !gaPrev.ok) return { ok: false, source: "ga4", error: `Previous period: ${gaPrev.error}` };
    if (gscCur && !gscCur.ok) return { ok: false, source: "gsc", error: gscCur.error };
    if (gscPrev && !gscPrev.ok) return { ok: false, source: "gsc", error: `Previous period: ${gscPrev.error}` };

    const current = gaCur && gaCur.ok ? gaCur.data : null;
    const previous = gaPrev && gaPrev.ok ? gaPrev.data : null;
    const search = gscCur && gscCur.ok ? gscCur.data : null;
    const searchPrev = gscPrev && gscPrev.ok ? gscPrev.data : null;

    const sessions = current?.sessions ?? 0;
    const convTotal = current?.conversions ?? 0;
    const rate = sessions > 0 ? Number(((convTotal / sessions) * 100).toFixed(2)) : 0;
    const prevSessions = previous?.sessions ?? 0;
    const prevConv = previous?.conversions ?? 0;
    const prevRate = prevSessions > 0 ? (prevConv / prevSessions) * 100 : 0;
    const prevGoals = new Map((goalsPrev || []).map((goal) => [goal.name, goal.count]));

    const metrics: MetricsSnapshot = {
      provider: "google",
      sources: { ga4: Boolean(current), gsc: Boolean(search) },
      periodStart: opts.periodStart.toISOString(),
      periodEnd: opts.periodEnd.toISOString(),
      previousPeriodStart: prevStart.toISOString(),
      previousPeriodEnd: prevEnd.toISOString(),
      organic: {
        sessions,
        sessionsDeltaPct: previous ? pctDelta(sessions, previous.sessions) : 0,
        users: current?.users ?? 0,
        usersDeltaPct: previous ? pctDelta(current?.users ?? 0, previous.users) : 0,
        pageviews: current?.pageviews ?? 0,
        pageviewsDeltaPct: previous ? pctDelta(current?.pageviews ?? 0, previous.pageviews) : 0,
      },
      topLandingPages: pages,
      search: search
        ? {
            clicks: search.clicks,
            clicksDeltaPct: searchPrev ? pctDelta(search.clicks, searchPrev.clicks) : 0,
            impressions: search.impressions,
            impressionsDeltaPct: searchPrev ? pctDelta(search.impressions, searchPrev.impressions) : 0,
            ctr: search.ctr,
            ctrDeltaPct: searchPrev ? pctDelta(search.ctr, searchPrev.ctr) : 0,
            avgPosition: search.avgPosition,
            avgPositionDelta: searchPrev
              ? Number((search.avgPosition - searchPrev.avgPosition).toFixed(1))
              : 0,
            topQueries: search.topQueries,
          }
        : {
            clicks: 0,
            clicksDeltaPct: 0,
            impressions: 0,
            impressionsDeltaPct: 0,
            ctr: 0,
            ctrDeltaPct: 0,
            avgPosition: 0,
            avgPositionDelta: 0,
            topQueries: [],
          },
      conversions: {
        total: convTotal,
        totalDeltaPct: previous ? pctDelta(convTotal, prevConv) : 0,
        rate,
        rateDeltaPct: previous ? pctDelta(rate, prevRate) : 0,
        goals: (goalsCur || []).map((goal) => ({
          name: goal.name,
          count: goal.count,
          deltaPct: pctDelta(goal.count, prevGoals.get(goal.name) ?? 0),
        })),
      },
    };

    return { ok: true, metrics, refreshed };
  } catch {
    return {
      ok: false,
      source: "config",
      error: "Google data could not be loaded. Nothing was filled in from the demo snapshot.",
    };
  }
}
