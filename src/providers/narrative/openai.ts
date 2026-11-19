import type { NarrativeInput, NarrativeResult } from "@/types/metrics";
import { completeChat, extractJsonObject } from "@/lib/llm";
import { generateTemplateNarrative } from "./template";

const NOT_CLAIMING =
  "What we are not claiming\nThese figures sit next to the work logged above. The relationship is correlation. This report does not claim the work produced the movement.";

export async function generateOpenAINarrative(input: NarrativeInput): Promise<NarrativeResult> {
  const fallback = generateTemplateNarrative(input);

  try {
    const prompt = `Write a client-safe monthly SEO report for a freelancer.
Use exactly these sections, separated by blank lines:
Proof of work for the client and period (one line)
What we shipped
What moved
What we are not claiming

Rules:
- Each shipped line names a work-log title, category, hours when present, and the body.
- Each moved line cites a number and its change versus the previous period.
- Say the relationship is correlation. Do not use the words caused, causality, or "directly correlated".
- Do not invent metrics or work items.
Return JSON: {"narrative":"...","nextActions":["...","...","..."]}
The three next actions must be editable tasks for next month. They must not claim a metric moved because of a task.

Client: ${input.clientName}
Agency: ${input.agencyName}
Period: ${input.periodLabel}
Metrics JSON: ${JSON.stringify(input.metrics)}
Work logs: ${JSON.stringify(input.workLogs)}`;

    const chat = await completeChat({
      system:
        "You write white-label SEO reports. You label correlation and you never claim that work caused a metric change. Return JSON only.",
      user: prompt,
      temperature: 0.3,
      maxTokens: 1200,
    });
    if (!chat) return fallback;
    const parsed = extractJsonObject(chat.content) as { narrative?: string; nextActions?: string[] } | null;
    if (!parsed) return fallback;
    if (!parsed.narrative || !parsed.nextActions || parsed.nextActions.length < 3) return fallback;

    let narrative = parsed.narrative
      .replace(/\bdirectly correlated\b/gi, "correlated")
      .replace(/\bcausality\b/gi, "correlation")
      .replace(/\bcaused\b/gi, "lined up with");
    if (!/correlation/i.test(narrative)) {
      narrative = `${narrative.trim()}\n\n${NOT_CLAIMING}`;
    }

    return {
      narrative,
      nextActions: [parsed.nextActions[0], parsed.nextActions[1], parsed.nextActions[2]],
      source: chat.provider,
    };
  } catch {
    return fallback;
  }
}
