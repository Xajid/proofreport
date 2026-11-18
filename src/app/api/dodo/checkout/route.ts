import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDodoPaymentsClient } from "@/lib/dodopayments";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = (await req.json()) as { plan: "per_client" | "agency" };
  const origin = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const dodo = getDodoPaymentsClient();

  // Fallback mock mode when Dodo Payments API key is not yet set
  if (!dodo) {
    await prisma.organization.update({
      where: { id: session.user.orgId },
      data: { plan },
    });
    return NextResponse.json({
      mode: "mock",
      message: "Dodo Payments not configured in .env — simulated mock checkout success",
      plan,
      redirectUrl: `${origin}/app/settings?checkout=mock_success&plan=${plan}`,
    });
  }

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
        email: session.user.email || "customer@example.com",
        name: session.user.name || undefined,
      },
      metadata: {
        orgId: session.user.orgId,
        plan,
      },
      return_url: `${origin}/app/settings?checkout=success&plan=${plan}`,
    });

    if (!checkoutSession.checkout_url) {
      return NextResponse.json(
        { error: "Dodo Payments did not return a checkout URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      mode: "dodo",
      redirectUrl: checkoutSession.checkout_url,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create Dodo Payments checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

