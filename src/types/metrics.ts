export type MetricsSnapshot = {
  provider: "mock" | "google";
  periodStart: string;
  periodEnd: string;
  previousPeriodStart: string;
  previousPeriodEnd: string;
  organic: {
    sessions: number;
    sessionsDeltaPct: number;
    users: number;
    usersDeltaPct: number;
    pageviews: number;
    pageviewsDeltaPct: number;
  };
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
  workLogs: { title: string; body: string; category: string }[];
};

export type NarrativeResult = {
  narrative: string;
  nextActions: [string, string, string];
  source: "openai" | "template";
};
