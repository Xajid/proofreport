import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDodoPaymentsClient } from "@/lib/dodopayments";

export async function POST(req: Request) {
  const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY?.trim();
  if (!webhookKey) {
    return NextResponse.json({ error: "Missing DODO_PAYMENTS_WEBHOOK_KEY" }, { status: 500 });
  }

  const dodo = getDodoPaymentsClient();
  if (!dodo) {
    return NextResponse.json({ error: "Dodo Payments client not initialized" }, { status: 500 });
  }

  const rawBody = await req.text();
  const headersObject: Record<string, string> = {};
  req.headers.forEach((val, key) => {
    headersObject[key.toLowerCase()] = val;
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any;
  try {
    event = dodo.webhooks.unwrap(rawBody, { headers: headersObject, key: webhookKey });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid Dodo Payments webhook signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (!event) {
    return NextResponse.json({ error: "Empty webhook event" }, { status: 400 });
  }

  try {
    const eventType = event.type || event.event_type;
    const data = event.data || {};
    const metadata = data.metadata || {};
    const orgId = metadata.orgId;
    const plan = metadata.plan;
    const quantity = Math.max(1, Number(metadata.quantity) || 1);
    const customerId = data.customer?.customer_id || data.customer_id;

    switch (eventType) {
      case "payment.succeeded":
      case "subscription.active":
      case "subscription.created": {
        if (orgId && (plan === "per_client" || plan === "agency")) {
          await prisma.organization.update({
            where: { id: orgId },
            data: {
              plan,
              ...(plan === "per_client" ? { clientSlots: quantity } : {}),
              ...(customerId ? { stripeCustomerId: customerId } : {}),
            },
          });
        }
        break;
      }

      case "subscription.cancelled":
      case "subscription.failed":
      case "subscription.expired": {
        if (orgId) {
          await prisma.organization.update({
            where: { id: orgId },
            data: { plan: "trial", clientSlots: 1, trialEndsAt: new Date() },
          });
        } else if (customerId) {
          await prisma.organization.updateMany({
            where: { stripeCustomerId: customerId },
            data: { plan: "trial", clientSlots: 1, trialEndsAt: new Date() },
          });
        }
        break;
      }

      default:
        // Ignore unhandled events
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error processing Dodo Payments webhook";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

