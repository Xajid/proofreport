export type Plan = "trial" | "per_client" | "agency";

export const PLAN_LIMITS = {
  trial: {
    maxClients: 1,
    watermark: true,
    aiMentions: false,
    cronScheduled: false,
  },
  per_client: {
    maxClients: Infinity,
    watermark: false,
    aiMentions: true,
    cronScheduled: false,
  },
  agency: {
    maxClients: Infinity,
    watermark: false,
    aiMentions: true,
    cronScheduled: true,
  },
} as const;

export function getLimits(plan: string | null | undefined) {
  if (!plan) return PLAN_LIMITS.trial;
  return PLAN_LIMITS[(plan as Plan) in PLAN_LIMITS ? (plan as Plan) : "trial"];
}
