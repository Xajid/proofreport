import { NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { prisma } from "@/lib/prisma";

function verifyState(token: string): { clientId: string; type: "ga4" | "gsc"; orgId: string } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const lastDot = decoded.lastIndexOf(".");
    if (lastDot === -1) return null;
    const payload = decoded.slice(0, lastDot);
    const sig = decoded.slice(lastDot + 1);
    const secret = process.env.NEXTAUTH_SECRET || "dev-oauth-state";
    const expected = createHmac("sha256", secret).update(payload).digest("hex").slice(0, 16);
    if (sig !== expected) return null;
    const [clientId, rawType, orgId] = payload.split(":");
    if (!clientId || !orgId) return null;
    return { clientId, type: rawType === "gsc" ? "gsc" : "ga4", orgId };
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");
  const origin = process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (!code || !stateParam) {
    return NextResponse.redirect(`${origin}/app/clients?oauth=error`);
  }

  const state = verifyState(stateParam);
  if (!state) {
    return NextResponse.redirect(`${origin}/app/clients?oauth=invalid_state`);
  }

  const client = await prisma.client.findFirst({
    where: { id: state.clientId, orgId: state.orgId },
  });
  if (!client) {
    return NextResponse.redirect(`${origin}/app/clients?oauth=not_found`);
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: `${origin}/api/integrations/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${origin}/app/clients/${client.id}?oauth=token_failed`);
  }

  const tokens = (await tokenRes.json()) as {
    access_token?: string;
    refresh_token?: string;
  };

  let externalId = state.type === "ga4" ? undefined : `sc-domain:${client.domain}`;
  let displayName =
    state.type === "ga4" ? `GA4 · ${client.name}` : `GSC · ${client.domain}`;

  if (tokens.access_token && state.type === "gsc") {
    const sitesRes = await fetch("https://www.googleapis.com/webmasters/v3/sites", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (sitesRes.ok) {
      const sitesJson = (await sitesRes.json()) as {
        siteEntry?: { siteUrl: string }[];
      };
      const match = sitesJson.siteEntry?.find((s) => s.siteUrl.includes(client.domain));
      if (match) {
        externalId = match.siteUrl;
        displayName = `GSC · ${match.siteUrl}`;
      }
    }
  }

  await prisma.connection.upsert({
    where: { clientId_type: { clientId: client.id, type: state.type } },
    create: {
      clientId: client.id,
      type: state.type,
      provider: "google",
      externalId,
      displayName,
      accessToken: tokens.access_token || null,
      refreshToken: tokens.refresh_token || null,
      metaJson: JSON.stringify({ mode: "google-oauth-connected" }),
    },
    update: {
      provider: "google",
      ...(externalId ? { externalId } : {}),
      displayName,
      accessToken: tokens.access_token || null,
      ...(tokens.refresh_token ? { refreshToken: tokens.refresh_token } : {}),
      metaJson: JSON.stringify({ mode: "google-oauth-connected" }),
    },
  });

  return NextResponse.redirect(`${origin}/app/clients/${client.id}?oauth=connected_${state.type}`);
}

