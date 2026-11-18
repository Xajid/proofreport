import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPaddleClient } from "@/lib/paddle";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = (await req.json()) as { plan: "per_client" | "agency" };
  const origin = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const paddle = getPaddleClient();

  // Mock / fallback mode when Paddle API key is not yet set
  if (!paddle) {
    await prisma.organization.update({
      where: { id: session.user.orgId },
      data: { plan },
    });
    return NextResponse.json({
      mode: "mock",
      message: "Paddle not configured in .env — simulated mock checkout success",
      plan,
      redirectUrl: `${origin}/app/settings?checkout=mock_success&plan=${plan}`,
    });
  }

  const priceId =
    plan === "agency"
      ? process.env.PADDLE_PRICE_AGENCY
      : process.env.PADDLE_PRICE_PER_CLIENT;

  if (!priceId) {
    return NextResponse.json(
      { error: "Missing PADDLE_PRICE_AGENCY or PADDLE_PRICE_PER_CLIENT environment variable" },
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

    const checkoutUrl = transaction.checkout?.url;
    if (!checkoutUrl) {
      return NextResponse.json({
        mode: "paddle_transaction",
        transactionId: transaction.id,
        redirectUrl: `${origin}/app/settings?checkout=pending&txn=${transaction.id}`,
      });
    }

    return NextResponse.json({
      mode: "paddle",
      redirectUrl: checkoutUrl,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create Paddle transaction";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

