import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = (await req.json()) as { plan: "per_client" | "agency" };
  const origin = process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({
      mode: "mock",
      message: "Stripe not configured — mock checkout success",
      plan,
      redirectUrl: `${origin}/app/settings?checkout=mock_success&plan=${plan}`,
    });
  }

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
