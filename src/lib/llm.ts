export type ChatProviderId = "nvidia" | "openai";

export type ChatConfig = {
  id: ChatProviderId;
  apiKey: string;
  model: string;
  url: string;
};

const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_NVIDIA_MODEL = "nvidia/nemotron-3.5-bolt-e4b";
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

/**
 * NVIDIA is preferred when its key is set so a test key does not spend OpenAI tokens.
 * Set AI_PROVIDER=openai or AI_PROVIDER=nvidia to force one. AI_PROVIDER=template skips both.
 */
export function resolveChatProvider(
  env: Record<string, string | undefined> = process.env
): ChatConfig | null {
  const read = (name: string) => {
    const value = env[name] ?? process.env[name];
    return typeof value === "string" ? value.trim() : "";
  };
  const forced = read("AI_PROVIDER").toLowerCase();
  const nvidiaKey = read("NVIDIA_API_KEY");
  const openaiKey = read("OPENAI_API_KEY");

  const nvidia = (): ChatConfig => ({
    id: "nvidia",
    apiKey: nvidiaKey || "",
    model: read("NVIDIA_MODEL") || DEFAULT_NVIDIA_MODEL,
    url: NVIDIA_URL,
  });
  const openai = (): ChatConfig => ({
    id: "openai",
    apiKey: openaiKey || "",
    model: read("OPENAI_MODEL") || DEFAULT_OPENAI_MODEL,
    url: OPENAI_URL,
  });

  if (forced === "template") return null;
  if (forced === "nvidia") return nvidiaKey ? nvidia() : null;
  if (forced === "openai") return openaiKey ? openai() : null;
  if (nvidiaKey) return nvidia();
  if (openaiKey) return openai();
  return null;
}

export function extractJsonObject(text: string): unknown | null {
  const withoutThink = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  const fenced = withoutThink.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fenced?.[1] ?? withoutThink).trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

export function urlsInText(text: string): string[] {
  const found = text.match(/https?:\/\/[^\s)\]>"']+/gi) ?? [];
  const cleaned = found.map((url) => url.replace(/[.,;]+$/, ""));
  return [...new Set(cleaned)];
}

type ChatMessage = { content?: string | null; reasoning_content?: string | null };

export async function completeChat(opts: {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<{ provider: ChatProviderId; model: string; content: string } | null> {
  const config = resolveChatProvider();
  if (!config) return null;

  const body: Record<string, unknown> = {
    model: config.model,
    temperature: opts.temperature ?? 0.3,
    max_tokens: opts.maxTokens ?? 900,
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ],
  };
  if (config.id === "openai") {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;

  const data = (await res.json()) as { choices?: { message?: ChatMessage }[] };
  const message = data.choices?.[0]?.message;
  const content = [message?.content, message?.reasoning_content].filter(Boolean).join("\n").trim();
  if (!content) return null;
  return { provider: config.id, model: config.model, content };
}
