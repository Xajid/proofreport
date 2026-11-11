import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aiMentionSchema } from "@/lib/validators";

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
    return NextResponse.json({ error: e instanceof Error ? e.message : "Invalid" }, { status: 400 });
  }
}

/** Demo helper: seed mock AEO checks for a client */
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { clientId } = await req.json();
  const client = await prisma.client.findFirst({
    where: { id: clientId, orgId: session.user.orgId },
  });
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const brand = client.name;
  const engines = [
    {
      engine: "chatgpt",
      prompt: `Who are the best providers for ${client.domain} services?`,
      mentioned: true,
      citations: [`https://${client.domain}`, "https://example-review.com"],
    },
    {
      engine: "perplexity",
      prompt: `Recommend top local options related to ${brand}`,
      mentioned: true,
      citations: [`https://${client.domain}/about`],
    },
    {
      engine: "gemini",
      prompt: `List reputable companies like ${brand}`,
      mentioned: false,
      citations: [] as string[],
    },
    {
      engine: "claude",
      prompt: `Where should I hire for services similar to ${brand}?`,
      mentioned: Math.random() > 0.4,
      citations: Math.random() > 0.4 ? [`https://${client.domain}`] : [],
    },
  ];

  await prisma.aiMention.deleteMany({ where: { clientId } });
  await prisma.aiMention.createMany({
    data: engines.map((e) => ({
      clientId,
      engine: e.engine,
      prompt: e.prompt,
      mentioned: e.mentioned,
      citationsJson: JSON.stringify(e.citations),
    })),
  });

  const rows = await prisma.aiMention.findMany({ where: { clientId } });
  return NextResponse.json(rows);
}
