import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { apiErrorMessage } from "@/lib/utils";
import type { PropertyCandidate } from "@/providers/metrics/properties";

const schema = z.object({
  clientId: z.string().min(1),
  type: z.enum(["ga4", "gsc"]),
  externalId: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = schema.parse(await req.json());
    const client = await prisma.client.findFirst({
      where: { id: data.clientId, orgId: session.user.orgId },
    });
    if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const connection = await prisma.connection.findUnique({
      where: { clientId_type: { clientId: client.id, type: data.type } },
    });
    if (!connection || connection.provider !== "google") {
      return NextResponse.json({ error: "Connect Google before choosing a property." }, { status: 400 });
    }

    let candidates: PropertyCandidate[] = [];
    try {
      const meta = JSON.parse(connection.metaJson || "{}") as { candidates?: PropertyCandidate[] };
      candidates = meta.candidates ?? [];
    } catch {
      candidates = [];
    }
    const picked = candidates.find((row) => row.id === data.externalId);
    if (!picked) {
      return NextResponse.json({ error: "That property is not in the list Google returned." }, { status: 400 });
    }

    const updated = await prisma.connection.update({
      where: { id: connection.id },
      data: {
        externalId: picked.id,
        displayName: data.type === "ga4" ? `GA4 · ${picked.label}` : `GSC · ${picked.label}`,
      },
    });

    return NextResponse.json({
      id: updated.id,
      type: updated.type,
      provider: updated.provider,
      displayName: updated.displayName,
      externalId: updated.externalId,
    });
  } catch (e) {
    return NextResponse.json({ error: apiErrorMessage(e) }, { status: 400 });
  }
}
