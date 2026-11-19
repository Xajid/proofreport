import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDodoPaymentsClient } from "@/lib/dodopayments";
import { apiErrorMessage } from "@/lib/utils";

function checkoutOrigin(req: Request) {
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || req.headers.get("host")?.trim();
  const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const proto = forwardedProto || (host?.startsWith("localhost") || host?.startsWith("127.0.0.1") ? "http" : "https");
  if (host && /^[a-z0-9.-]+(?::\d+)?$/i.test(host)) return `${proto}://${host}`;
  return process.env.NEXTAUTH_URL || "http://localhost:3000";
}

const checkoutSchema = z.object({
  plan: z.enum(["per_client", "agency"]),
  quantity: z.number().int().min(1).max(100).optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let plan: "per_client" | "agency";
  let quantity = 1;
  try {
    const body = checkoutSchema.parse(await req.json());
    plan = body.plan;
    quantity = plan === "agency" ? 1 : (body.quantity ?? 1);
  } catch (e) {
    return NextResponse.json({ error: apiErrorMessage(e) }, { status: 400 });
  }
  const origin = checkoutOrigin(req);

  const dodo = getDodoPaymentsClient();

  // Fallback when Dodo Payments is not configured. Does not charge a card.
  if (!dodo) {
    await prisma.organization.update({
      where: { id: session.user.orgId },
      data: {
        plan,
        clientSlots: plan === "per_client" ? quantity : undefined,
      },
    });
    return NextResponse.json({
      mode: "mock",
      message: "Dodo Payments not configured in .env — simulated mock checkout success",
      plan,
      redirectUrl: `${origin}/app/settings?checkout=mock_success&plan=${encodeURIComponent(plan)}`,
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
      product_cart: [{ product_id: productId, quantity }],
      customer: {
        email: session.user.email || "unknown@checkout.getsearchproof.com",
        name: session.user.name || undefined,
      },
      metadata: {
        orgId: session.user.orgId,
        plan,
        quantity: String(quantity),
      },
      return_url: `${origin}/checkout/return?checkout=success&plan=${encodeURIComponent(plan)}`,
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

