import DodoPayments from "dodopayments";

export function getDodoPaymentsClient(): DodoPayments | null {
  const bearerToken = process.env.DODO_PAYMENTS_API_KEY?.trim();
  if (!bearerToken) return null;

  const isLive = process.env.DODO_PAYMENTS_ENV === "live_mode";

  return new DodoPayments({
    bearerToken,
    environment: isLive ? "live_mode" : "test_mode",
    webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY?.trim() || null,
  });
}

