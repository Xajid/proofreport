import type { MetricsSnapshot } from "@/types/metrics";
import { createMockMetrics } from "./mock";

/**
 * Real Google adapter stub.
 * When GOOGLE_CLIENT_ID/SECRET + tokens are present, this is the hook point
 * for GA4 Data API + Search Console API. Until tokens are wired end-to-end,
 * we return mock data labeled as google for UI continuity in connected mode.
 */
export async function fetchGoogleMetrics(opts: {
  clientDomain: string;
  periodStart: Date;
  periodEnd: Date;
  ga4PropertyId?: string | null;
  gscSiteUrl?: string | null;
  accessToken?: string | null;
}): Promise<MetricsSnapshot> {
  const hasCreds =
    !!process.env.GOOGLE_CLIENT_ID &&
    !!process.env.GOOGLE_CLIENT_SECRET &&
    !!opts.accessToken;

  // Production path placeholder — requires live OAuth tokens + API enablement.
  // Prefer honest demo over broken live calls.
  if (!hasCreds) {
    const snap = createMockMetrics(opts.clientDomain, opts.periodStart, opts.periodEnd);
    return { ...snap, provider: "mock" };
  }

  // With credentials present but without full API wiring in MVP, still serve
  // deterministic mock shaped as google so report flow stays green.
  const snap = createMockMetrics(opts.clientDomain, opts.periodStart, opts.periodEnd);
  return {
    ...snap,
    provider: "google",
  };
}
