import type { NarrativeInput, NarrativeResult } from "@/types/metrics";
import { formatNumber, formatPct } from "@/lib/utils";

const NOT_CLAIMING =
  "What we are not claiming\nThese figures sit next to the work logged above. The relationship is correlation. This report does not claim the work produced the movement.";

export function generateTemplateNarrative(input: NarrativeInput): NarrativeResult {
  const { metrics, workLogs, clientName, periodLabel } = input;
  const topQuery = metrics.search.topQueries[0]?.query;
  const topPage = metrics.topLandingPages?.[0]?.path;

  const shipped = workLogs.length
    ? workLogs
        .slice(0, 8)
        .map((w) => {
          const hours = w.hours ? `, ${w.hours}h` : "";
          const detail = w.body?.trim() ? `: ${w.body.trim()}` : "";
          return `• ${w.title} (${w.category}${hours})${detail}`;
        })
        .join("\n")
    : "• No work-log entries were recorded for this period.";

  const positionNote =
    metrics.search.avgPosition > 0
      ? `Average position is ${metrics.search.avgPosition} (${metrics.search.avgPositionDelta >= 0 ? "+" : ""}${metrics.search.avgPositionDelta} versus the previous period; a lower number is a better ranking).`
      : "Search Console position was not connected for this period.";

  const moved = [
    `Organic sessions: ${formatNumber(metrics.organic.sessions)} (${formatPct(metrics.organic.sessionsDeltaPct)} versus the previous period of the same length).`,
    `Search clicks: ${formatNumber(metrics.search.clicks)} (${formatPct(metrics.search.clicksDeltaPct)}). Impressions: ${formatNumber(metrics.search.impressions)} (${formatPct(metrics.search.impressionsDeltaPct)}).`,
    positionNote,
    `Conversions: ${formatNumber(metrics.conversions.total)} (${formatPct(metrics.conversions.totalDeltaPct)}) at a ${metrics.conversions.rate}% conversion rate.`,
    topPage ? `Top landing page by organic sessions: ${topPage}.` : "",
    topQuery ? `Query with the most clicks: ${topQuery}.` : "",
  ]
    .filter(Boolean)
    .map((line) => `• ${line}`)
    .join("\n");

  const narrative = [
    `Proof of work for ${clientName} (${periodLabel}).`,
    `What we shipped\n${shipped}`,
    `What moved\n${moved}`,
    NOT_CLAIMING,
  ].join("\n\n");

  const queryLabel = topQuery ? `"${topQuery}"` : "the query with the most clicks";
  const pageLabel = topPage ? topPage : "the top landing page";

  const nextActions: [string, string, string] = [
    metrics.search.avgPosition > 10
      ? `Refresh the page that ranks for ${queryLabel} while it sits outside the top 10.`
      : `Add a supporting section around ${queryLabel} and record it in next month's work log.`,
    metrics.conversions.totalDeltaPct < 0
      ? `Review ${pageLabel} and note whether the primary call to action is still the one clients use.`
      : `Keep the conversion path on ${pageLabel} and log any change you make to it.`,
    workLogs.some((w) => w.category === "technical")
      ? "Finish the technical items still open in the work log, then recheck the same templates next month."
      : "Log a technical pass for indexation and internal links before the next report.",
  ];

  return { narrative, nextActions, source: "template" };
}
