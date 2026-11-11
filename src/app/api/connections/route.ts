import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { connectionSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = connectionSchema.parse(await req.json());
    const client = await prisma.client.findFirst({
      where: { id: data.clientId, orgId: session.user.orgId },
    });
    if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const useGoogle =
      data.provider === "google" &&
      !!process.env.GOOGLE_CLIENT_ID &&
      !!process.env.GOOGLE_CLIENT_SECRET;

    const connection = await prisma.connection.upsert({
      where: { clientId_type: { clientId: data.clientId, type: data.type } },
      create: {
        clientId: data.clientId,
        type: data.type,
        provider: useGoogle ? "google" : "mock",
        externalId:
          data.externalId ||
          (data.type === "ga4" ? `properties/${100000 + Math.floor(Math.random() * 900000)}` : `sc-domain:${client.domain}`),
        displayName:
          data.displayName ||
          (data.type === "ga4" ? `GA4 · ${client.name}` : `GSC · ${client.domain}`),
        accessToken: useGoogle ? "pending-oauth" : "mock-token",
        metaJson: JSON.stringify({
          mode: useGoogle ? "google-ready" : "demo-mock",
          note: useGoogle
            ? "Google OAuth credentials detected; complete token exchange in production."
            : "Using demo metrics provider.",
        }),
      },
      update: {
        provider: useGoogle ? "google" : "mock",
        externalId: data.externalId,
        displayName: data.displayName,
      },
    });

    return NextResponse.json(connection);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Invalid" }, { status: 400 });
  }
}
