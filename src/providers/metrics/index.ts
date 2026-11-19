import type { MetricsSnapshot } from "@/types/metrics";
import { prisma } from "@/lib/prisma";
import { createMockMetrics } from "./mock";
import { fetchGoogleMetrics, type ConnectedSource, type MetricsFetchResult, type RefreshedToken } from "./google";

export type MetricsProviderInput = {
  clientDomain: string;
  periodStart: Date;
  periodEnd: Date;
  preferredProvider?: "mock" | "google";
  ga4?: ConnectedSource | null;
  gsc?: ConnectedSource | null;
};

export async function applyRefreshedTokens(refreshed: RefreshedToken[]) {
  await Promise.all(
    refreshed.map((row) =>
      prisma.connection.update({
        where: { id: row.connectionId },
        data: { accessToken: row.accessToken },
      })
    )
  );
}

export function googleSources(
  connections: {
    id: string;
    type: string;
    provider: string;
    externalId: string | null;
    accessToken: string | null;
    refreshToken: string | null;
  }[]
) {
  const toSource = (row: (typeof connections)[number]): ConnectedSource => ({
    connectionId: row.id,
    externalId: row.externalId,
    accessToken: row.accessToken,
    refreshToken: row.refreshToken,
  });
  const ga4 = connections.find((row) => row.type === "ga4" && row.provider === "google");
  const gsc = connections.find((row) => row.type === "gsc" && row.provider === "google");
  return {
    preferredProvider: ga4 || gsc ? ("google" as const) : ("mock" as const),
    ga4: ga4 ? toSource(ga4) : null,
    gsc: gsc ? toSource(gsc) : null,
  };
}

export const metricsProvider = {
  async fetch(input: MetricsProviderInput): Promise<MetricsFetchResult> {
    if (input.preferredProvider === "google") {
      return fetchGoogleMetrics({
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        ga4: input.ga4,
        gsc: input.gsc,
      });
    }
    const metrics: MetricsSnapshot = createMockMetrics(input.clientDomain, input.periodStart, input.periodEnd);
    return { ok: true, metrics, refreshed: [] };
  },
};

export { createMockMetrics, fetchGoogleMetrics };
export type { ConnectedSource, MetricsFetchResult, RefreshedToken };
