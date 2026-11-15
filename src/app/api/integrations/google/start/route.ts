import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createHmac } from "node:crypto";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function signState(payload: string): string {
  const secret = process.env.NEXTAUTH_SECRET || "dev-oauth-state";
  const sig = createHmac("sha256", secret).update(payload).digest("hex").slice(0, 16);
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const clientId = url.searchParams.get("clientId");
  const type = url.searchParams.get("type") === "gsc" ? "gsc" : "ga4";

  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

  const client = await prisma.client.findFirst({
    where: { id: clientId, orgId: session.user.orgId },
  });
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const clientIdEnv = process.env.GOOGLE_CLIENT_ID;
  const origin = process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (!clientIdEnv || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(
      `${origin}/app/clients/${clientId}?oauth=not_configured`
    );
  }

  const scope =
    type === "ga4"
      ? "https://www.googleapis.com/auth/analytics.readonly"
      : "https://www.googleapis.com/auth/webmasters.readonly";

  const state = signState(`${clientId}:${type}:${session.user.orgId}`);
  const params = new URLSearchParams({
    client_id: clientIdEnv,
    redirect_uri: `${origin}/api/integrations/google/callback`,
    response_type: "code",
    scope,
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}

