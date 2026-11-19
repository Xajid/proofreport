export type MetricsSnapshot = {
  provider: "mock" | "google";
  periodStart: string;
  periodEnd: string;
  previousPeriodStart: string;
  previousPeriodEnd: string;
  sources?: {
    ga4: boolean;
    gsc: boolean;
  };
  organic: {
    sessions: number;
    sessionsDeltaPct: number;
    users: number;
    usersDeltaPct: number;
    pageviews: number;
    pageviewsDeltaPct: number;
  };
  topLandingPages?: { path: string; sessions: number }[];
  search: {
    clicks: number;
    clicksDeltaPct: number;
    impressions: number;
    impressionsDeltaPct: number;
    ctr: number;
    ctrDeltaPct: number;
    avgPosition: number;
    avgPositionDelta: number;
    topQueries: { query: string; clicks: number; impressions: number; position: number }[];
  };
  conversions: {
    total: number;
    totalDeltaPct: number;
    rate: number;
    rateDeltaPct: number;
    goals: { name: string; count: number; deltaPct: number }[];
  };
};

export type NarrativeInput = {
  clientName: string;
  agencyName: string;
  periodLabel: string;
  metrics: MetricsSnapshot;
  workLogs: { title: string; body: string; category: string; hours?: number | null }[];
};

export type NarrativeResult = {
  narrative: string;
  nextActions: [string, string, string];
  source: "openai" | "nvidia" | "template";
};
