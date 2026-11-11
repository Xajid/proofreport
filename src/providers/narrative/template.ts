import type { NarrativeInput, NarrativeResult } from "@/types/metrics";
import { formatNumber, formatPct } from "@/lib/utils";

export function generateTemplateNarrative(input: NarrativeInput): NarrativeResult {
  const { metrics, workLogs, clientName, periodLabel } = input;
  const workBits = workLogs
    .slice(0, 5)
    .map((w) => w.title)
    .join("; ");

  const sessionDir = metrics.organic.sessionsDeltaPct >= 0 ? "grew" : "softened";
  const clickDir = metrics.search.clicksDeltaPct >= 0 ? "increased" : "declined";
  const convDir = metrics.conversions.totalDeltaPct >= 0 ? "up" : "down";

  const narrative = [
    `For ${clientName} (${periodLabel}), organic sessions ${sessionDir} ${formatPct(metrics.organic.sessionsDeltaPct)} to ${formatNumber(metrics.organic.sessions)}, while Search Console clicks ${clickDir} ${formatPct(metrics.search.clicksDeltaPct)} to ${formatNumber(metrics.search.clicks)}.`,
    `Conversions finished ${convDir} ${formatPct(metrics.conversions.totalDeltaPct)} at ${formatNumber(metrics.conversions.total)} (${metrics.conversions.rate}% conversion rate). Average search position moved ${metrics.search.avgPositionDelta >= 0 ? "+" : ""}${metrics.search.avgPositionDelta} to ${metrics.search.avgPosition}.`,
    workLogs.length
      ? `Work logged this period included: ${workBits}. These activities are correlated with the metric movement above; we treat the link as directional rather than proven causation.`
      : `No work-log entries were recorded for this period, so the narrative focuses on metric movement only.`,
    `Impressions ${metrics.search.impressionsDeltaPct >= 0 ? "expanded" : "contracted"} ${formatPct(metrics.search.impressionsDeltaPct)}, suggesting ${metrics.search.impressionsDeltaPct >= 0 ? "broader query coverage" : "tighter visibility"} heading into next month.`,
  ].join(" ");

  const nextActions: [string, string, string] = [
    metrics.search.avgPosition > 10
      ? "Prioritize on-page refreshes for queries ranking positions 8–15 to capture quick click gains."
      : "Expand supporting content around top converting queries to defend and widen rankings.",
    metrics.conversions.totalDeltaPct < 5
      ? "Tighten CTA and form UX on top landing pages driving organic sessions."
      : "Scale the conversion paths that outperformed — replicate layout/CTA patterns on adjacent pages.",
    workLogs.some((w) => w.category === "technical")
      ? "Ship remaining technical fixes and re-validate Core Web Vitals on key templates."
      : "Run a technical crawl pass on indexation, redirects, and internal linking for priority sections.",
  ];

  return { narrative, nextActions, source: "template" };
}
