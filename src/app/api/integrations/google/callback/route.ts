import { NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { listGa4Properties, listGscSites, matchingSites, type PropertyCandidate } from "@/providers/metrics/properties";

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

function chooseProperty(candidates: PropertyCandidate[]): {
  externalId: string | null;
  displayName: string;
  needsPick: boolean;
} {
  if (candidates.length === 1) {
    return { externalId: candidates[0].id, displayName: candidates[0].label, needsPick: false };
  }
  return {
    externalId: null,
    displayName: candidates.length === 0 ? "No properties returned" : "Choose a property",
    needsPick: true,
  };
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

  let candidates: PropertyCandidate[] = [];
  if (tokens.access_token && state.type === "ga4") {
    candidates = await listGa4Properties(tokens.access_token);
  } else if (tokens.access_token && state.type === "gsc") {
    const sites = await listGscSites(tokens.access_token);
    const matched = matchingSites(sites, client.domain);
    candidates = matched.length > 0 ? matched : sites;
  }

  const choice = chooseProperty(candidates);
  const displayName =
    state.type === "ga4"
      ? choice.externalId
        ? `GA4 · ${choice.displayName}`
        : "GA4 · choose a property"
      : choice.externalId
        ? `GSC · ${choice.displayName}`
        : "Search Console · choose a property";

  await prisma.connection.upsert({
    where: { clientId_type: { clientId: client.id, type: state.type } },
    create: {
      clientId: client.id,
      type: state.type,
      provider: "google",
      externalId: choice.externalId,
      displayName,
      accessToken: tokens.access_token || null,
      refreshToken: tokens.refresh_token || null,
      metaJson: JSON.stringify({ mode: "google-oauth-connected", candidates }),
    },
    update: {
      provider: "google",
      externalId: choice.externalId,
      displayName,
      accessToken: tokens.access_token || null,
      ...(tokens.refresh_token ? { refreshToken: tokens.refresh_token } : {}),
      metaJson: JSON.stringify({ mode: "google-oauth-connected", candidates }),
    },
  });

  const flag =
    candidates.length === 0
      ? state.type === "ga4"
        ? "no_ga4_properties"
        : "no_gsc_sites"
      : choice.needsPick
        ? `select_${state.type}`
        : `connected_${state.type}`;

  return NextResponse.redirect(`${origin}/app/clients/${client.id}?oauth=${flag}`);
}
