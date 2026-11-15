import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook secrets not configured" },
      { status: 400 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const rawBody = await req.text();
  const stripe = new Stripe(secretKey);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orgId = session.metadata?.orgId;
    const plan = session.metadata?.plan;
    const customerId =
      typeof session.customer === "string" ? session.customer : session.customer?.id;

    if (orgId && (plan === "per_client" || plan === "agency")) {
      await prisma.organization.update({
        where: { id: orgId },
        data: {
          plan,
          ...(customerId ? { stripeCustomerId: customerId } : {}),
        },
      });
    }
  } else if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id;

    if (customerId) {
      await prisma.organization.updateMany({
        where: { stripeCustomerId: customerId },
        data: { plan: "trial" },
      });
    }
  }

  return NextResponse.json({ received: true });
}

