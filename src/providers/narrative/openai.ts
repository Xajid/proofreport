import type { NarrativeInput, NarrativeResult } from "@/types/metrics";
import { generateTemplateNarrative } from "./template";

export async function generateOpenAINarrative(input: NarrativeInput): Promise<NarrativeResult> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return generateTemplateNarrative(input);

  const fallback = generateTemplateNarrative(input);

  try {
    const prompt = `You write client-safe monthly SEO executive summaries for freelancers.
Cite metric deltas and tie them to work-log items. Label correlation vs causation.
Return JSON: {"narrative":"...","nextActions":["...","...","..."]}

Client: ${input.clientName}
Agency: ${input.agencyName}
Period: ${input.periodLabel}
Metrics JSON: ${JSON.stringify(input.metrics)}
Work logs: ${JSON.stringify(input.workLogs)}`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are an expert SEO account manager writing white-label client reports." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) return fallback;
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return fallback;
    const parsed = JSON.parse(content) as { narrative?: string; nextActions?: string[] };
    if (!parsed.narrative || !parsed.nextActions || parsed.nextActions.length < 3) return fallback;
    return {
      narrative: parsed.narrative,
      nextActions: [parsed.nextActions[0], parsed.nextActions[1], parsed.nextActions[2]],
      source: "openai",
    };
  } catch {
    return fallback;
  }
}
