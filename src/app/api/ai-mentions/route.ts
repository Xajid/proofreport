import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aiMentionSchema } from "@/lib/validators";
import { apiErrorMessage } from "@/lib/utils";
import { getLimits } from "@/lib/plan";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const clientId = new URL(req.url).searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });
  const client = await prisma.client.findFirst({
    where: { id: clientId, orgId: session.user.orgId },
  });
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const rows = await prisma.aiMention.findMany({
    where: { clientId },
    orderBy: { checkedAt: "desc" },
  });
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await prisma.organization.findUnique({
    where: { id: session.user.orgId },
    select: { plan: true },
  });
  if (!getLimits(org?.plan).aiMentions) {
    return NextResponse.json(
      {
        error: "AI Mentions (AEO visibility) requires an upgraded plan.",
        code: "PLAN_LIMIT",
        plan: org?.plan,
      },
      { status: 403 }
    );
  }

  try {
    const data = aiMentionSchema.parse(await req.json());
    const client = await prisma.client.findFirst({
      where: { id: data.clientId, orgId: session.user.orgId },
    });
    if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Light mock AEO: if caller doesn't force values, invent a plausible result
    const row = await prisma.aiMention.create({
      data: {
        clientId: data.clientId,
        engine: data.engine,
        prompt: data.prompt,
        mentioned: data.mentioned,
        citationsJson: JSON.stringify(data.citations),
      },
    });
    return NextResponse.json(row);
  } catch (e) {
    return NextResponse.json({ error: apiErrorMessage(e) }, { status: 400 });
  }
}

/** Demo helper: append mock AEO checks for a client (preserving historical snapshots) */
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await prisma.organization.findUnique({
    where: { id: session.user.orgId },
    select: { plan: true },
  });
  if (!getLimits(org?.plan).aiMentions) {
    return NextResponse.json(
      {
        error: "AI Mentions (AEO visibility) requires an upgraded plan.",
        code: "PLAN_LIMIT",
        plan: org?.plan,
      },
      { status: 403 }
    );
  }

  const { clientId, customPrompt } = (await req.json()) as {
    clientId: string;
    customPrompt?: string;
  };
  const client = await prisma.client.findFirst({
    where: { id: clientId, orgId: session.user.orgId },
  });
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const brand = client.name;
  const promptTrimmed = customPrompt?.trim();
  const engines = [
    {
      engine: "chatgpt",
      prompt: promptTrimmed || `Who are the best providers for ${client.domain} services?`,
      mentioned: true,
      citations: [`https://${client.domain}`, "https://example-review.com"],
    },
    {
      engine: "perplexity",
      prompt: promptTrimmed || `Recommend top local options related to ${brand}`,
      mentioned: true,
      citations: [`https://${client.domain}/about`],
    },
    {
      engine: "gemini",
      prompt: promptTrimmed || `List reputable companies like ${brand}`,
      mentioned: false,
      citations: [] as string[],
    },
    {
      engine: "claude",
      prompt: promptTrimmed || `Where should I hire for services similar to ${brand}?`,
      mentioned: Math.random() > 0.4,
      citations: Math.random() > 0.4 ? [`https://${client.domain}`] : [],
    },
  ];

  await prisma.aiMention.createMany({
    data: engines.map((e) => ({
      clientId,
      engine: e.engine,
      prompt: e.prompt,
      mentioned: e.mentioned,
      citationsJson: JSON.stringify(e.citations),
    })),
  });

  const rows = await prisma.aiMention.findMany({
    where: { clientId },
    orderBy: { checkedAt: "desc" },
    take: 20,
  });
  return NextResponse.json(rows);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const existing = await prisma.aiMention.findFirst({
    where: { id, client: { orgId: session.user.orgId } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.aiMention.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
