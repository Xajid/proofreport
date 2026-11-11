import type { MetricsSnapshot } from "@/types/metrics";
import { createMockMetrics } from "./mock";
import { fetchGoogleMetrics } from "./google";

export type MetricsProviderInput = {
  clientDomain: string;
  periodStart: Date;
  periodEnd: Date;
  preferredProvider?: "mock" | "google";
  ga4PropertyId?: string | null;
  gscSiteUrl?: string | null;
  accessToken?: string | null;
};

export interface MetricsProvider {
  fetch(input: MetricsProviderInput): Promise<MetricsSnapshot>;
}

export const metricsProvider: MetricsProvider = {
  async fetch(input) {
    if (input.preferredProvider === "google" || input.accessToken) {
      return fetchGoogleMetrics(input);
    }
    return createMockMetrics(input.clientDomain, input.periodStart, input.periodEnd);
  },
};

export { createMockMetrics, fetchGoogleMetrics };
