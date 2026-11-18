import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDodoPaymentsClient } from "@/lib/dodopayments";
import { getPaddleClient } from "@/lib/paddle";
import Stripe from "stripe";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = (await req.json()) as { plan: "per_client" | "agency" };
  const origin = process.env.NEXTAUTH_URL || "http://localhost:3000";

  // 1. If Dodo Payments is configured, prioritize Dodo
  const dodo = getDodoPaymentsClient();
  if (dodo) {
    const productId =
      plan === "agency"
        ? process.env.DODO_PRODUCT_AGENCY
        : process.env.DODO_PRODUCT_PER_CLIENT;

    if (!productId) {
      return NextResponse.json(
        { error: "Missing DODO_PRODUCT_AGENCY or DODO_PRODUCT_PER_CLIENT in environment" },
        { status: 400 }
      );
    }

    try {
      const checkoutSession = await dodo.checkoutSessions.create({
        product_cart: [{ product_id: productId, quantity: 1 }],
        customer: {
          email: session.user.email || "unknown@checkout.getsearchproof.com",
          name: session.user.name || undefined,
        },
        metadata: {
          orgId: session.user.orgId,
          plan,
        },
        return_url: `${origin}/app/settings?checkout=success&plan=${plan}`,
      });

      return NextResponse.json({
        mode: "dodo",
        redirectUrl: checkoutSession.checkout_url || `${origin}/app/settings?checkout=pending`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create Dodo Payments checkout";
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }

  // 2. If Paddle is configured
  const paddle = getPaddleClient();
  if (paddle) {
    const priceId =
      plan === "agency"
        ? process.env.PADDLE_PRICE_AGENCY
        : process.env.PADDLE_PRICE_PER_CLIENT;

    if (!priceId) {
      return NextResponse.json(
        { error: "Missing PADDLE_PRICE_AGENCY or PADDLE_PRICE_PER_CLIENT" },
        { status: 400 }
      );
    }

    try {
      const transaction = await paddle.transactions.create({
        items: [{ priceId, quantity: 1 }],
        customData: {
          orgId: session.user.orgId,
          plan,
          customerEmail: session.user.email || undefined,
        },
      });

      return NextResponse.json({
        mode: "paddle",
        redirectUrl: transaction.checkout?.url || `${origin}/app/settings?checkout=pending&txn=${transaction.id}`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create Paddle transaction";
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }

  // 3. If Stripe is configured
  if (process.env.STRIPE_SECRET_KEY) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const priceId =
      plan === "agency"
        ? process.env.STRIPE_PRICE_AGENCY
        : process.env.STRIPE_PRICE_PER_CLIENT;

    if (!priceId) {
      return NextResponse.json({ error: "Missing Stripe price IDs" }, { status: 400 });
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/app/settings?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=cancel`,
      customer_email: session.user.email || undefined,
      metadata: { orgId: session.user.orgId, plan },
    });

    return NextResponse.json({ mode: "stripe", redirectUrl: checkout.url });
  }

  // 4. Fallback mock mode for local testing
  await prisma.organization.update({
    where: { id: session.user.orgId },
    data: { plan },
  });
  return NextResponse.json({
    mode: "mock",
    message: "Billing not configured — simulated mock upgrade success",
    plan,
    redirectUrl: `${origin}/app/settings?checkout=mock_success&plan=${plan}`,
  });
}
