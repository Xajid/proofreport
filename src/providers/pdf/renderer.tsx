import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { MetricsSnapshot } from "@/types/metrics";
import { formatNumber, formatPct, periodLabel } from "@/lib/utils";

export type PdfReportData = {
  agencyName: string;
  logoUrl?: string | null;
  primaryColor: string;
  clientName: string;
  clientDomain: string;
  periodStart: string;
  periodEnd: string;
  narrative: string;
  nextActions: string[];
  metrics: MetricsSnapshot;
  workLogs: { title: string; body: string; category: string }[];
  watermark?: boolean;
  aiMentions?: { engine: string; prompt: string; mentioned: boolean; citations: string[] }[];
  includeAiMentions?: boolean;
};

function stylesFor(primary: string) {
  return StyleSheet.create({
    page: {
      padding: 48,
      fontSize: 11,
      fontFamily: "Helvetica",
      color: "#1c1917",
      backgroundColor: "#fafaf9",
    },
    watermark: {
      position: "absolute",
      top: "40%",
      left: 40,
      right: 40,
      textAlign: "center",
      fontSize: 48,
      color: "#d6d3d1",
      opacity: 0.45,
      transform: "rotate(-28deg)",
    },
    coverTitle: { fontSize: 28, fontFamily: "Helvetica-Bold", color: primary, marginBottom: 12 },
    h1: { fontSize: 20, fontFamily: "Helvetica-Bold", color: primary, marginBottom: 16 },
    h2: { fontSize: 14, fontFamily: "Helvetica-Bold", marginBottom: 8, marginTop: 12 },
    muted: { color: "#78716c", marginBottom: 6 },
    body: { lineHeight: 1.5, marginBottom: 10 },
    metricRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
    metricBox: {
      flex: 1,
      padding: 12,
      backgroundColor: "#fff",
      borderWidth: 1,
      borderColor: "#e7e5e4",
      borderRadius: 4,
    },
    metricLabel: { fontSize: 9, color: "#78716c", marginBottom: 4 },
    metricValue: { fontSize: 16, fontFamily: "Helvetica-Bold" },
    listItem: { marginBottom: 8, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: primary },
    footer: { position: "absolute", bottom: 28, left: 48, right: 48, fontSize: 9, color: "#a8a29e" },
  });
}

function Watermark({ show }: { show?: boolean }) {
  if (!show) return null;
  return <Text style={stylesFor("#000").watermark}>SAMPLE</Text>;
}

export function ReportDocument(data: PdfReportData) {
  const s = stylesFor(data.primaryColor || "#0F766E");
  const period = periodLabel(data.periodStart, data.periodEnd);
  const m = data.metrics;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Watermark show={data.watermark} />
        <Text style={s.muted}>{data.agencyName}</Text>
        <Text style={s.coverTitle}>Monthly SEO Report</Text>
        <Text style={{ fontSize: 18, marginBottom: 8 }}>{data.clientName}</Text>
        <Text style={s.muted}>{data.clientDomain}</Text>
        <Text style={{ marginTop: 24, fontSize: 14 }}>{period}</Text>
        <Text style={s.footer}>Prepared by {data.agencyName} · Confidential</Text>
      </Page>

      <Page size="A4" style={s.page}>
        <Watermark show={data.watermark} />
        <Text style={s.h1}>Executive summary</Text>
        <Text style={s.body}>{data.narrative}</Text>
        <Text style={s.footer}>1 · Executive summary</Text>
      </Page>

      <Page size="A4" style={s.page}>
        <Watermark show={data.watermark} />
        <Text style={s.h1}>Organic performance</Text>
        <Text style={s.h2}>Website (GA4)</Text>
        <View style={s.metricRow}>
          <View style={s.metricBox}>
            <Text style={s.metricLabel}>Sessions</Text>
            <Text style={s.metricValue}>{formatNumber(m.organic.sessions)}</Text>
            <Text style={s.muted}>{formatPct(m.organic.sessionsDeltaPct)}</Text>
          </View>
          <View style={s.metricBox}>
            <Text style={s.metricLabel}>Users</Text>
            <Text style={s.metricValue}>{formatNumber(m.organic.users)}</Text>
            <Text style={s.muted}>{formatPct(m.organic.usersDeltaPct)}</Text>
          </View>
          <View style={s.metricBox}>
            <Text style={s.metricLabel}>Pageviews</Text>
            <Text style={s.metricValue}>{formatNumber(m.organic.pageviews)}</Text>
            <Text style={s.muted}>{formatPct(m.organic.pageviewsDeltaPct)}</Text>
          </View>
        </View>
        <Text style={s.h2}>Search Console</Text>
        <View style={s.metricRow}>
          <View style={s.metricBox}>
            <Text style={s.metricLabel}>Clicks</Text>
            <Text style={s.metricValue}>{formatNumber(m.search.clicks)}</Text>
            <Text style={s.muted}>{formatPct(m.search.clicksDeltaPct)}</Text>
          </View>
          <View style={s.metricBox}>
            <Text style={s.metricLabel}>Impressions</Text>
            <Text style={s.metricValue}>{formatNumber(m.search.impressions)}</Text>
            <Text style={s.muted}>{formatPct(m.search.impressionsDeltaPct)}</Text>
          </View>
          <View style={s.metricBox}>
            <Text style={s.metricLabel}>Avg position</Text>
            <Text style={s.metricValue}>{m.search.avgPosition}</Text>
            <Text style={s.muted}>
              {m.search.avgPositionDelta >= 0 ? "+" : ""}
              {m.search.avgPositionDelta}
            </Text>
          </View>
        </View>
        <Text style={s.h2}>Top queries</Text>
        {m.search.topQueries.slice(0, 5).map((q) => (
          <Text key={q.query} style={s.body}>
            {q.query} — {formatNumber(q.clicks)} clicks · pos {q.position.toFixed(1)}
          </Text>
        ))}
        <Text style={s.footer}>2 · Organic</Text>
      </Page>

      <Page size="A4" style={s.page}>
        <Watermark show={data.watermark} />
        <Text style={s.h1}>Conversions</Text>
        <View style={s.metricRow}>
          <View style={s.metricBox}>
            <Text style={s.metricLabel}>Total conversions</Text>
            <Text style={s.metricValue}>{formatNumber(m.conversions.total)}</Text>
            <Text style={s.muted}>{formatPct(m.conversions.totalDeltaPct)}</Text>
          </View>
          <View style={s.metricBox}>
            <Text style={s.metricLabel}>Conversion rate</Text>
            <Text style={s.metricValue}>{m.conversions.rate}%</Text>
            <Text style={s.muted}>{formatPct(m.conversions.rateDeltaPct)}</Text>
          </View>
        </View>
        <Text style={s.h2}>Goals</Text>
        {m.conversions.goals.map((g) => (
          <Text key={g.name} style={s.body}>
            {g.name}: {formatNumber(g.count)} ({formatPct(g.deltaPct)})
          </Text>
        ))}
        <Text style={s.footer}>3 · Conversions</Text>
      </Page>

      <Page size="A4" style={s.page}>
        <Watermark show={data.watermark} />
        <Text style={s.h1}>Work log</Text>
        {data.workLogs.length === 0 ? (
          <Text style={s.muted}>No work logged for this period.</Text>
        ) : (
          data.workLogs.map((w, i) => (
            <View key={i} style={s.listItem}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>
                [{w.category}] {w.title}
              </Text>
              <Text style={s.body}>{w.body}</Text>
            </View>
          ))
        )}
        <Text style={s.footer}>4 · Work log</Text>
      </Page>

      <Page size="A4" style={s.page}>
        <Watermark show={data.watermark} />
        <Text style={s.h1}>Next month plan</Text>
        {data.nextActions.map((a, i) => (
          <View key={i} style={s.listItem}>
            <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 4 }}>Action {i + 1}</Text>
            <Text style={s.body}>{a}</Text>
          </View>
        ))}
        <Text style={s.footer}>5 · Next actions</Text>
      </Page>

      {data.includeAiMentions && data.aiMentions && data.aiMentions.length > 0 ? (
        <Page size="A4" style={s.page}>
          <Watermark show={data.watermark} />
          <Text style={s.h1}>AI search mentions</Text>
          <Text style={s.muted}>Light AEO check — prompt results by engine</Text>
          {data.aiMentions.map((mrow, i) => (
            <View key={i} style={{ marginTop: 12 }}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>
                {mrow.engine}: {mrow.mentioned ? "Mentioned" : "Not mentioned"}
              </Text>
              <Text style={s.body}>Prompt: {mrow.prompt}</Text>
              {mrow.citations?.length ? (
                <Text style={s.muted}>Citations: {mrow.citations.join("; ")}</Text>
              ) : null}
            </View>
          ))}
          <Text style={s.footer}>6 · AI mentions</Text>
        </Page>
      ) : null}
    </Document>
  );
}

export interface PdfRenderer {
  render(data: PdfReportData): Promise<Buffer>;
}

export const pdfRenderer: PdfRenderer = {
  async render(data) {
    const buffer = await renderToBuffer(<ReportDocument {...data} />);
    return Buffer.from(buffer);
  },
};
