export type Plan = "trial" | "per_client" | "agency";

export type BillingOrg = {
  plan?: string | null;
  clientSlots?: number | null;
  trialEndsAt?: Date | string | null;
  createdAt?: Date | string | null;
};

export const PLAN_LIMITS = {
  trial: {
    maxClients: 1,
    watermark: true,
    aiMentions: false,
    cronScheduled: false,
  },
  per_client: {
    maxClients: 1,
    watermark: false,
    aiMentions: true,
    cronScheduled: false,
  },
  agency: {
    maxClients: Number.POSITIVE_INFINITY,
    watermark: false,
    aiMentions: true,
    cronScheduled: true,
  },
} as const;

function asDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function resolveTrialEnd(org?: BillingOrg | null): Date | null {
  const plan = org?.plan && org.plan in PLAN_LIMITS ? org.plan : "trial";
  if (plan !== "trial") return null;
  const explicit = asDate(org?.trialEndsAt);
  if (explicit) return explicit;
  const created = asDate(org?.createdAt);
  if (!created) return null;
  const end = new Date(created);
  end.setUTCDate(end.getUTCDate() + 14);
  return end;
}

export function isTrialExpired(org?: BillingOrg | null, now = new Date()): boolean {
  const end = resolveTrialEnd(org);
  if (!end) return false;
  return end.getTime() <= now.getTime();
}

export function getLimits(plan: string | null | undefined, org?: BillingOrg | null) {
  const key: Plan = plan && plan in PLAN_LIMITS ? (plan as Plan) : "trial";
  const base = PLAN_LIMITS[key];
  const billing: BillingOrg = { ...org, plan: key };
  const expired = key === "trial" && isTrialExpired(billing);
  const slots = Math.max(1, org?.clientSlots ?? 1);
  const maxClients = expired ? 0 : key === "per_client" ? slots : base.maxClients;
  return {
    ...base,
    maxClients,
    expired,
    trialEndsAt: key === "trial" ? resolveTrialEnd(billing) : null,
  };
}

export function trialEndedMessage(): string {
  return "Your 14-day trial has ended. Upgrade to keep generating and sending reports.";
}

/** Paid plans bill concurrent clients. The free plan keeps a slot after the client is deleted. */
export function holdsClientSlot(plan: string | null | undefined): boolean {
  return plan !== "per_client" && plan !== "agency";
}

export function clientSlotsUsed(
  plan: string | null | undefined,
  liveCount: number,
  clientsCreated = 0
): number {
  if (!holdsClientSlot(plan)) return liveCount;
  return Math.max(liveCount, clientsCreated);
}
