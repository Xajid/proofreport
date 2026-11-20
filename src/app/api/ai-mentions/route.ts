import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aiMentionSchema } from "@/lib/validators";
import { apiErrorMessage } from "@/lib/utils";
import { getLimits } from "@/lib/plan";
import { completeChat, extractJsonObject, resolveChatProvider, urlsInText } from "@/lib/llm";

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
        source: "mock",
      },
    });
    return NextResponse.json(row);
  } catch (e) {
    return NextResponse.json({ error: apiErrorMessage(e) }, { status: 400 });
  }
}

/** Ask the configured model and store the prompt, model, time, and URLs from its answer. */
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const chatConfig = resolveChatProvider();
  if (!chatConfig) {
    return NextResponse.json(
      { error: "Live checks are not available right now." },
      { status: 400 }
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

  const prompt =
    customPrompt?.trim() ||
    `Who are the best providers for services like those on ${client.domain}? Mention specific companies and link to sources when you have them.`;

  const chat = await completeChat({
    system:
      "Answer the buyer question in plain sentences. Then return JSON only with keys answer, mentioned, and citations. mentioned is true only if your answer names the brand or domain. citations must be URLs that appear in your answer. Do not invent URLs.",
    user: `Brand: ${client.name}\nDomain: ${client.domain}\nBuyer question: ${prompt}`,
    temperature: 0.2,
    maxTokens: 700,
  });
  if (!chat) {
    return NextResponse.json(
      { error: `${chatConfig.model} did not return an answer. Nothing was saved.` },
      { status: 502 }
    );
  }

  const parsed = extractJsonObject(chat.content) as { answer?: string } | null;
  const answer = (parsed?.answer || chat.content).trim();
  const answerLower = answer.toLowerCase();
  const mentioned =
    answerLower.includes(client.name.toLowerCase()) || answerLower.includes(client.domain.toLowerCase());
  const citations = urlsInText(answer);

  await prisma.aiMention.create({
    data: {
      clientId,
      engine: chat.model,
      prompt,
      mentioned,
      citationsJson: JSON.stringify(citations),
      source: "live",
    },
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
