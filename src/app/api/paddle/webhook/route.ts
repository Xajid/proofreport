import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaddleClient } from "@/lib/paddle";

export async function POST(req: Request) {
  const secretKey = process.env.PADDLE_WEBHOOK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Missing PADDLE_WEBHOOK_SECRET_KEY" }, { status: 500 });
  }

  const signature = req.headers.get("paddle-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing paddle-signature header" }, { status: 400 });
  }

  const paddle = getPaddleClient();
  if (!paddle) {
    return NextResponse.json({ error: "Paddle client not initialized" }, { status: 500 });
  }

  const rawBody = await req.text();
  let event;
  try {
    event = await paddle.webhooks.unmarshal(rawBody, secretKey, signature);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid Paddle webhook signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (!event) {
    return NextResponse.json({ error: "Failed to parse webhook event" }, { status: 400 });
  }

  try {
    const eventType = event.eventType;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = event.data;

    switch (eventType) {
      case "transaction.completed": {
        const orgId = data.customData?.orgId;
        const plan = data.customData?.plan;
        const customerId = data.customerId;

        if (orgId && (plan === "per_client" || plan === "agency")) {
          await prisma.organization.update({
            where: { id: orgId },
            data: {
              plan,
              ...(customerId ? { stripeCustomerId: customerId } : {}),
            },
          });
        }
        break;
      }

      case "subscription.activated":
      case "subscription.created": {
        const orgId = data.customData?.orgId;
        const plan = data.customData?.plan || "per_client";
        const customerId = data.customerId;

        if (orgId) {
          await prisma.organization.update({
            where: { id: orgId },
            data: {
              plan,
              ...(customerId ? { stripeCustomerId: customerId } : {}),
            },
          });
        }
        break;
      }

      case "subscription.canceled":
      case "subscription.past_due": {
        const customerId = data.customerId;
        if (customerId) {
          await prisma.organization.updateMany({
            where: { stripeCustomerId: customerId },
            data: { plan: "trial" },
          });
        }
        break;
      }

      default:
        // Ignore unhandled event types
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error processing Paddle webhook";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

