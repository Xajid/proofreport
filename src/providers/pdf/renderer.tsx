import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  Svg,
  Rect,
  Polyline,
  Circle,
  Line,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { MetricsSnapshot } from "@/types/metrics";
import { formatNumber, formatPct, periodLabel } from "@/lib/utils";

export type PdfTrendPoint = {
  label: string;
  sessions: number;
  clicks: number;
  conversions: number;
};

export type PdfReportData = {
  agencyName: string;
  logoUrl?: string | null;
  resolvedLogoUri?: string | null;
  primaryColor: string;
  clientName: string;
  clientDomain: string;
  periodStart: string;
  periodEnd: string;
  narrative: string;
  nextActions: string[];
  metrics: MetricsSnapshot;
  workLogs: { title: string; body: string; category: string; hours?: number | null }[];
  trendHistory?: PdfTrendPoint[];
  watermark?: boolean;
  aiMentions?: { engine: string; prompt: string; mentioned: boolean; citations: string[] }[];
  includeAiMentions?: boolean;
};

async function resolveLogoDataUri(url?: string | null): Promise<string | null> {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const ct = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (ct !== "image/png" && ct !== "image/jpeg" && ct !== "image/jpg") return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength === 0 || buf.byteLength > 2 * 1024 * 1024) return null;
    const mime = ct === "image/jpg" ? "image/jpeg" : ct;
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/* ─── Color Utilities ─── */

function normalizeHex(hex: string | undefined): string {
  if (!hex) return "#0D6E68";
  const clean = hex.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(clean)) return clean;
  if (/^#[0-9a-fA-F]{3}$/.test(clean)) {
    const r = clean[1];
    const g = clean[2];
    const b = clean[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return "#0D6E68";
}

function mixWithWhite(hex: string, whiteRatio: number): string {
  const n = normalizeHex(hex);
  const r = parseInt(n.slice(1, 3), 16);
  const g = parseInt(n.slice(3, 5), 16);
  const b = parseInt(n.slice(5, 7), 16);
  const mix = (c: number) => Math.round(c * (1 - whiteRatio) + 255 * whiteRatio);
  const toHex = (c: number) => c.toString(16).padStart(2, "0");
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}

function mixWithBlack(hex: string, blackRatio: number): string {
  const n = normalizeHex(hex);
  const r = parseInt(n.slice(1, 3), 16);
  const g = parseInt(n.slice(3, 5), 16);
  const b = parseInt(n.slice(5, 7), 16);
  const mix = (c: number) => Math.round(c * (1 - blackRatio));
  const toHex = (c: number) => c.toString(16).padStart(2, "0");
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "PR";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

/* ─── Palette & Styles ─── */

const SLATE_950 = "#090D16";
const SLATE_900 = "#0F172A";
const SLATE_800 = "#1E293B";
const SLATE_600 = "#475569";
const SLATE_500 = "#64748B";
const SLATE_400 = "#94A3B8";
const SLATE_200 = "#E2E8F0";
const SLATE_100 = "#F1F5F9";
const SLATE_50 = "#F8FAFC";
const WHITE = "#FFFFFF";

const EMERALD_TEXT = "#047857";
const EMERALD_BG = "#ECFDF5";
const AMBER_TEXT = "#B45309";
const AMBER_BG = "#FFFBEB";

function createStyles(rawPrimary: string) {
  const primary = normalizeHex(rawPrimary);
  const primaryDark = mixWithBlack(primary, 0.25);
  const primaryTint = mixWithWhite(primary, 0.92);
  const primaryBorder = mixWithWhite(primary, 0.72);

  return StyleSheet.create({
    /* Cover Page */
    coverPage: {
      backgroundColor: WHITE,
      fontFamily: "Helvetica",
      color: SLATE_900,
      padding: 0,
    },
    coverHero: {
      backgroundColor: SLATE_950,
      paddingTop: 52,
      paddingBottom: 48,
      paddingHorizontal: 52,
      borderBottomWidth: 4,
      borderBottomColor: primary,
    },
    coverTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 44,
    },
    agencyLockup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    agencyMonogram: {
      width: 28,
      height: 28,
      borderRadius: 6,
      backgroundColor: primary,
      alignItems: "center",
      justifyContent: "center",
    },
    agencyLogoImg: {
      width: 28,
      height: 28,
      borderRadius: 6,
      objectFit: "contain",
      backgroundColor: WHITE,
    },
    agencyMonogramText: {
      color: WHITE,
      fontSize: 11,
      fontFamily: "Helvetica-Bold",
      letterSpacing: 0.5,
    },
    agencyHeaderName: {
      color: WHITE,
      fontSize: 13,
      fontFamily: "Helvetica-Bold",
    },
    confidentialBadge: {
      paddingVertical: 4,
      paddingHorizontal: 9,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: "#334155",
      backgroundColor: "#1E293B",
    },
    confidentialText: {
      color: "#CBD5E1",
      fontSize: 7.5,
      fontFamily: "Helvetica-Bold",
      letterSpacing: 1.4,
    },
    coverEyebrow: {
      color: mixWithWhite(primary, 0.45),
      fontSize: 9,
      fontFamily: "Helvetica-Bold",
      letterSpacing: 1.8,
      marginBottom: 12,
    },
    coverTitle: {
      color: WHITE,
      fontSize: 32,
      fontFamily: "Helvetica-Bold",
      lineHeight: 1.15,
      marginBottom: 10,
    },
    coverSubtitle: {
      color: "#94A3B8",
      fontSize: 13,
      lineHeight: 1.45,
    },
    coverDomainPill: {
      marginTop: 18,
      alignSelf: "flex-start",
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 4,
      backgroundColor: "#1E293B",
      borderWidth: 1,
      borderColor: "#334155",
    },
    coverDomainText: {
      color: "#E2E8F0",
      fontSize: 9.5,
      fontFamily: "Courier",
    },
    coverBody: {
      paddingHorizontal: 52,
      paddingTop: 36,
      paddingBottom: 56,
      flex: 1,
      justifyContent: "space-between",
    },
    coverSectionLabel: {
      fontSize: 8.5,
      fontFamily: "Helvetica-Bold",
      color: SLATE_500,
      letterSpacing: 1.4,
      marginBottom: 14,
    },
    coverKpiGrid: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 28,
    },
    coverKpiCard: {
      flex: 1,
      backgroundColor: SLATE_50,
      borderWidth: 1,
      borderColor: SLATE_200,
      borderRadius: 6,
      padding: 13,
    },
    coverKpiLabel: {
      fontSize: 8,
      fontFamily: "Helvetica-Bold",
      color: SLATE_500,
      letterSpacing: 0.6,
      marginBottom: 6,
    },
    coverKpiValue: {
      fontSize: 18,
      fontFamily: "Helvetica-Bold",
      color: SLATE_900,
      marginBottom: 6,
    },
    coverMetaGrid: {
      flexDirection: "row",
      borderTopWidth: 1,
      borderTopColor: SLATE_200,
      paddingTop: 22,
      gap: 20,
    },
    coverMetaCol: {
      flex: 1,
    },
    coverMetaLabel: {
      fontSize: 7.5,
      fontFamily: "Helvetica-Bold",
      color: SLATE_400,
      letterSpacing: 1.1,
      marginBottom: 4,
    },
    coverMetaValue: {
      fontSize: 10,
      fontFamily: "Helvetica-Bold",
      color: SLATE_800,
      marginBottom: 2,
    },
    coverMetaSub: {
      fontSize: 9,
      color: SLATE_500,
    },
    coverTocBox: {
      marginTop: 24,
      padding: 16,
      borderRadius: 6,
      backgroundColor: primaryTint,
      borderWidth: 1,
      borderColor: primaryBorder,
    },
    coverTocTitle: {
      fontSize: 8.5,
      fontFamily: "Helvetica-Bold",
      color: primaryDark,
      letterSpacing: 1.1,
      marginBottom: 8,
    },
    coverTocRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    coverTocItem: {
      fontSize: 9,
      color: SLATE_800,
    },

    /* Content Pages */
    page: {
      paddingTop: 68,
      paddingBottom: 58,
      paddingHorizontal: 48,
      fontSize: 10,
      fontFamily: "Helvetica",
      color: SLATE_800,
      backgroundColor: WHITE,
    },
    runningHeader: {
      position: "absolute",
      top: 26,
      left: 48,
      right: 48,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: SLATE_200,
    },
    runningHeaderLeft: {
      fontSize: 8.5,
      fontFamily: "Helvetica-Bold",
      color: SLATE_600,
    },
    runningHeaderRight: {
      fontSize: 8.5,
      color: SLATE_400,
    },
    runningFooter: {
      position: "absolute",
      bottom: 24,
      left: 48,
      right: 48,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: SLATE_200,
    },
    footerText: {
      fontSize: 8,
      color: SLATE_400,
    },
    watermark: {
      position: "absolute",
      top: "42%",
      left: 40,
      right: 40,
      textAlign: "center",
      fontSize: 54,
      fontFamily: "Helvetica-Bold",
      color: "#CBD5E1",
      opacity: 0.28,
      transform: "rotate(-28deg)",
      letterSpacing: 8,
    },

    /* Section Headings */
    sectionEyebrow: {
      fontSize: 8.5,
      fontFamily: "Helvetica-Bold",
      color: primary,
      letterSpacing: 1.5,
      marginBottom: 5,
    },
    h1: {
      fontSize: 21,
      fontFamily: "Helvetica-Bold",
      color: SLATE_900,
      marginBottom: 6,
    },
    sectionRule: {
      width: 36,
      height: 2.5,
      backgroundColor: primary,
      marginBottom: 18,
      borderRadius: 2,
    },
    h2: {
      fontSize: 11,
      fontFamily: "Helvetica-Bold",
      color: SLATE_900,
      marginTop: 18,
      marginBottom: 9,
      letterSpacing: 0.2,
    },
    leadText: {
      fontSize: 10,
      color: SLATE_500,
      lineHeight: 1.5,
      marginBottom: 16,
    },

    /* Executive Narrative */
    calloutCard: {
      backgroundColor: primaryTint,
      borderLeftWidth: 3,
      borderLeftColor: primary,
      borderRadius: 4,
      paddingVertical: 14,
      paddingHorizontal: 16,
      marginBottom: 18,
    },
    calloutTitle: {
      fontSize: 8.5,
      fontFamily: "Helvetica-Bold",
      color: primaryDark,
      letterSpacing: 1.1,
      marginBottom: 8,
    },
    calloutGrid: {
      flexDirection: "row",
      gap: 14,
    },
    calloutStat: {
      flex: 1,
    },
    calloutStatLabel: {
      fontSize: 8,
      color: SLATE_600,
      marginBottom: 2,
    },
    calloutStatVal: {
      fontSize: 13,
      fontFamily: "Helvetica-Bold",
      color: SLATE_900,
    },
    paragraph: {
      fontSize: 10.5,
      lineHeight: 1.65,
      color: SLATE_800,
      marginBottom: 12,
    },
    summaryNoteBox: {
      marginTop: 14,
      padding: 14,
      backgroundColor: SLATE_50,
      borderWidth: 1,
      borderColor: SLATE_200,
      borderRadius: 6,
    },
    summaryNoteTitle: {
      fontSize: 9,
      fontFamily: "Helvetica-Bold",
      color: SLATE_900,
      marginBottom: 5,
    },
    summaryNoteText: {
      fontSize: 9.2,
      lineHeight: 1.5,
      color: SLATE_600,
    },

    /* Metric Cards */
    metricRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 6,
    },
    metricCard: {
      flex: 1,
      backgroundColor: WHITE,
      borderWidth: 1,
      borderColor: SLATE_200,
      borderRadius: 6,
      padding: 12,
    },
    metricLabel: {
      fontSize: 8,
      fontFamily: "Helvetica-Bold",
      color: SLATE_500,
      letterSpacing: 0.5,
      marginBottom: 5,
    },
    metricValue: {
      fontSize: 17,
      fontFamily: "Helvetica-Bold",
      color: SLATE_900,
      marginBottom: 6,
    },
    deltaPillPositive: {
      alignSelf: "flex-start",
      backgroundColor: EMERALD_BG,
      paddingVertical: 2.5,
      paddingHorizontal: 6,
      borderRadius: 4,
    },
    deltaTextPositive: {
      fontSize: 8,
      fontFamily: "Helvetica-Bold",
      color: EMERALD_TEXT,
    },
    deltaPillNegative: {
      alignSelf: "flex-start",
      backgroundColor: AMBER_BG,
      paddingVertical: 2.5,
      paddingHorizontal: 6,
      borderRadius: 4,
    },
    deltaTextNegative: {
      fontSize: 8,
      fontFamily: "Helvetica-Bold",
      color: AMBER_TEXT,
    },

    /* Tables */
    table: {
      borderWidth: 1,
      borderColor: SLATE_200,
      borderRadius: 6,
      overflow: "hidden",
      marginTop: 4,
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: SLATE_100,
      borderBottomWidth: 1,
      borderBottomColor: SLATE_200,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    tableHeaderCell: {
      fontSize: 7.5,
      fontFamily: "Helvetica-Bold",
      color: SLATE_500,
      letterSpacing: 0.8,
    },
    tableRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8.5,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: SLATE_100,
    },
    tableRowAlt: {
      backgroundColor: SLATE_50,
    },
    tableCell: {
      fontSize: 9.5,
      color: SLATE_800,
    },
    tableCellBold: {
      fontSize: 9.5,
      fontFamily: "Helvetica-Bold",
      color: SLATE_900,
    },

    /* Progress Bar inside Goal Table */
    barTrack: {
      height: 5,
      backgroundColor: SLATE_100,
      borderRadius: 3,
      overflow: "hidden",
      marginTop: 4,
    },
    barFill: {
      height: 5,
      backgroundColor: primary,
      borderRadius: 3,
    },

    /* Work Log Cards */
    workCard: {
      borderWidth: 1,
      borderColor: SLATE_200,
      borderLeftWidth: 3,
      borderLeftColor: primary,
      borderRadius: 6,
      backgroundColor: WHITE,
      padding: 13,
      marginBottom: 10,
    },
    workHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 6,
    },
    categoryBadge: {
      backgroundColor: primaryTint,
      borderWidth: 1,
      borderColor: primaryBorder,
      borderRadius: 4,
      paddingVertical: 2,
      paddingHorizontal: 6,
    },
    categoryText: {
      fontSize: 7.5,
      fontFamily: "Helvetica-Bold",
      color: primaryDark,
      letterSpacing: 0.8,
    },
    workTitle: {
      fontSize: 11,
      fontFamily: "Helvetica-Bold",
      color: SLATE_900,
      flex: 1,
    },
    workHoursBadge: {
      backgroundColor: SLATE_100,
      borderRadius: 4,
      paddingVertical: 2,
      paddingHorizontal: 6,
    },
    workHoursText: {
      fontSize: 7.5,
      fontFamily: "Helvetica-Bold",
      color: SLATE_600,
    },
    chartBox: {
      borderWidth: 1,
      borderColor: SLATE_200,
      borderRadius: 6,
      backgroundColor: SLATE_50,
      padding: 12,
      marginTop: 6,
      marginBottom: 10,
    },
    chartTitle: {
      fontSize: 8,
      fontFamily: "Helvetica-Bold",
      color: SLATE_500,
      letterSpacing: 0.9,
      marginBottom: 8,
    },
    workBody: {
      fontSize: 9.8,
      lineHeight: 1.55,
      color: SLATE_600,
    },

    /* Action Roadmap Cards */
    actionCard: {
      flexDirection: "row",
      gap: 14,
      borderWidth: 1,
      borderColor: SLATE_200,
      borderRadius: 6,
      backgroundColor: SLATE_50,
      padding: 15,
      marginBottom: 12,
    },
    actionNumberBox: {
      width: 28,
      height: 28,
      borderRadius: 6,
      backgroundColor: primary,
      alignItems: "center",
      justifyContent: "center",
    },
    actionNumberText: {
      color: WHITE,
      fontSize: 11,
      fontFamily: "Helvetica-Bold",
    },
    actionContent: {
      flex: 1,
    },
    actionLabel: {
      fontSize: 8,
      fontFamily: "Helvetica-Bold",
      color: primary,
      letterSpacing: 1,
      marginBottom: 4,
    },
    actionText: {
      fontSize: 10.5,
      lineHeight: 1.55,
      color: SLATE_900,
    },

    /* AI Mentions */
    aiCard: {
      borderWidth: 1,
      borderColor: SLATE_200,
      borderRadius: 6,
      padding: 13,
      marginBottom: 10,
      backgroundColor: WHITE,
    },
    aiCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    aiEngineName: {
      fontSize: 11,
      fontFamily: "Helvetica-Bold",
      color: SLATE_900,
    },
    aiPromptBox: {
      backgroundColor: SLATE_50,
      borderRadius: 4,
      paddingVertical: 7,
      paddingHorizontal: 10,
      marginBottom: 6,
    },
    aiPromptText: {
      fontSize: 9.2,
      color: SLATE_800,
      lineHeight: 1.45,
    },
    aiCitationText: {
      fontSize: 8.2,
      fontFamily: "Courier",
      color: SLATE_500,
    },
  });
}

type Styles = ReturnType<typeof createStyles>;

/* ─── Reusable Sub-Components ─── */

function Watermark({ show, s }: { show?: boolean; s: Styles }) {
  if (!show) return null;
  return <Text fixed style={s.watermark}>SAMPLE REPORT</Text>;
}

function PageChrome({
  s,
  data,
  period,
}: {
  s: Styles;
  data: PdfReportData;
  period: string;
}) {
  return (
    <>
      <View fixed style={s.runningHeader}>
        <Text style={s.runningHeaderLeft}>
          {data.clientName}  ·  {period}
        </Text>
        <Text style={s.runningHeaderRight}>{data.agencyName}</Text>
      </View>
      <View fixed style={s.runningFooter}>
        <Text style={s.footerText}>
          Prepared by {data.agencyName}  ·  Confidential Client Report
        </Text>
        <Text
          style={s.footerText}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        />
      </View>
    </>
  );
}

function DeltaBadge({
  s,
  label,
  positive,
}: {
  s: Styles;
  label: string;
  positive: boolean;
}) {
  return (
    <View style={positive ? s.deltaPillPositive : s.deltaPillNegative}>
      <Text style={positive ? s.deltaTextPositive : s.deltaTextNegative}>
        {label}
      </Text>
    </View>
  );
}

function SectionHeading({
  s,
  eyebrow,
  title,
  subtitle,
}: {
  s: Styles;
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View>
      <Text style={s.sectionEyebrow}>{eyebrow}</Text>
      <Text style={s.h1}>{title}</Text>
      <View style={s.sectionRule} />
      {subtitle ? <Text style={s.leadText}>{subtitle}</Text> : null}
    </View>
  );
}

function QueryClicksChart({
  queries,
  primary,
}: {
  queries: { query: string; clicks: number }[];
  primary: string;
}) {
  const top = queries.slice(0, 5);
  if (top.length === 0) return null;
  const maxClicks = Math.max(...top.map((q) => q.clicks), 1);
  const trackWidth = 270;

  return (
    <View style={{ marginTop: 4 }}>
      {top.map((q) => {
        const barW = Math.max(8, Math.round((q.clicks / maxClicks) * trackWidth));
        return (
          <View
            key={q.query}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <Text
              style={{
                width: 155,
                fontSize: 8.5,
                color: SLATE_800,
                paddingRight: 8,
              }}
            >
              {q.query.length > 26 ? `${q.query.slice(0, 24)}…` : q.query}
            </Text>
            <Svg width={trackWidth} height={10}>
              <Rect x={0} y={1} width={trackWidth} height={8} rx={3} fill={SLATE_200} />
              <Rect x={0} y={1} width={barW} height={8} rx={3} fill={primary} />
            </Svg>
            <Text
              style={{
                width: 48,
                fontSize: 8.5,
                fontFamily: "Helvetica-Bold",
                color: SLATE_900,
                textAlign: "right",
              }}
            >
              {formatNumber(q.clicks)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function TrendLineSvg({
  points,
  primary,
}: {
  points: PdfTrendPoint[];
  primary: string;
}) {
  if (points.length < 2) return null;
  const w = 468;
  const h = 54;
  const padX = 10;
  const padY = 8;
  const vals = points.map((p) => p.sessions);
  const minVal = Math.min(...vals);
  const maxVal = Math.max(...vals);
  const range = Math.max(maxVal - minVal, 1);

  const coords = points.map((p, idx) => {
    const x = padX + (idx / (points.length - 1)) * (w - padX * 2);
    const y = h - padY - ((p.sessions - minVal) / range) * (h - padY * 2);
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)), label: p.label, val: p.sessions };
  });

  const polylinePts = coords.map((c) => `${c.x},${c.y}`).join(" ");

  return (
    <View>
      <Svg width={w} height={h}>
        <Line x1={padX} y1={h - padY} x2={w - padX} y2={h - padY} stroke={SLATE_200} strokeWidth={1} />
        <Polyline points={polylinePts} fill="none" stroke={primary} strokeWidth={2} />
        {coords.map((c, idx) => (
          <Circle key={idx} cx={c.x} cy={c.y} r={3} fill={primary} />
        ))}
      </Svg>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
        {coords.map((c, idx) => (
          <Text key={idx} style={{ fontSize: 7.5, color: SLATE_500 }}>
            {c.label}: {formatNumber(c.val)}
          </Text>
        ))}
      </View>
    </View>
  );
}

/* ─── Document ─── */

export function ReportDocument(data: PdfReportData) {
  const primary = normalizeHex(data.primaryColor || "#0D6E68");
  const s = createStyles(primary);
  const period = periodLabel(data.periodStart, data.periodEnd);
  const m = data.metrics;
  const hasAi = Boolean(data.includeAiMentions && data.aiMentions && data.aiMentions.length > 0);
  const paragraphs = (data.narrative || "")
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const actions = (data.nextActions || []).filter((a) => a.trim().length > 0);
  const posDeltaStr = `${m.search.avgPositionDelta >= 0 ? "+" : ""}${m.search.avgPositionDelta}`;
  const providerLabel = m.provider === "google" ? "GA4 + Search Console (Live)" : "GA4 + GSC (Demo Snapshot)";
  const totalHours = data.workLogs.reduce((acc, w) => acc + (w.hours || 0), 0);

  const tocSections = [
    "01  Executive Summary",
    "02  Organic & Search Performance",
    "03  Conversions & Goals",
    "04  Proof of Work",
    "05  Next Month Roadmap",
    ...(hasAi ? ["06  AI Search Visibility"] : []),
  ];

  const aiMentionedCount = (data.aiMentions || []).filter((a) => a.mentioned).length;

  return (
    <Document
      title={`${data.clientName} — Monthly SEO Report (${period})`}
      author={data.agencyName}
      subject={`Monthly SEO Performance Report for ${data.clientName}`}
    >
      {/* ── PAGE 1: COVER ── */}
      <Page size="A4" style={s.coverPage}>
        <Watermark show={data.watermark} s={s} />
        <View style={s.coverHero}>
          <View style={s.coverTopRow}>
            <View style={s.agencyLockup}>
              {data.resolvedLogoUri ? (
                /* eslint-disable-next-line jsx-a11y/alt-text */
                <Image src={data.resolvedLogoUri} style={s.agencyLogoImg} />
              ) : (
                <View style={s.agencyMonogram}>
                  <Text style={s.agencyMonogramText}>{initialsOf(data.agencyName)}</Text>
                </View>
              )}
              <Text style={s.agencyHeaderName}>{data.agencyName}</Text>
            </View>
            <View style={s.confidentialBadge}>
              <Text style={s.confidentialText}>
                {data.watermark ? "SAMPLE REPORT" : "CONFIDENTIAL"}
              </Text>
            </View>
          </View>

          <Text style={s.coverEyebrow}>MONTHLY SEO PERFORMANCE REPORT</Text>
          <Text style={s.coverTitle}>{data.clientName}</Text>
          <Text style={s.coverSubtitle}>
            Organic visibility, conversion outcomes, completed deliverables, and priorities for the upcoming cycle.
          </Text>
          <View style={s.coverDomainPill}>
            <Text style={s.coverDomainText}>{data.clientDomain}</Text>
          </View>
        </View>

        <View style={s.coverBody}>
          <View>
            <Text style={s.coverSectionLabel}>PERIOD SNAPSHOT  ·  {period.toUpperCase()}</Text>
            <View style={s.coverKpiGrid}>
              <View style={s.coverKpiCard}>
                <Text style={s.coverKpiLabel}>ORGANIC SESSIONS</Text>
                <Text style={s.coverKpiValue}>{formatNumber(m.organic.sessions)}</Text>
                <DeltaBadge
                  s={s}
                  label={`${formatPct(m.organic.sessionsDeltaPct)} MoM`}
                  positive={m.organic.sessionsDeltaPct >= 0}
                />
              </View>
              <View style={s.coverKpiCard}>
                <Text style={s.coverKpiLabel}>SEARCH CLICKS</Text>
                <Text style={s.coverKpiValue}>{formatNumber(m.search.clicks)}</Text>
                <DeltaBadge
                  s={s}
                  label={`${formatPct(m.search.clicksDeltaPct)} MoM`}
                  positive={m.search.clicksDeltaPct >= 0}
                />
              </View>
              <View style={s.coverKpiCard}>
                <Text style={s.coverKpiLabel}>CONVERSIONS</Text>
                <Text style={s.coverKpiValue}>{formatNumber(m.conversions.total)}</Text>
                <DeltaBadge
                  s={s}
                  label={`${formatPct(m.conversions.totalDeltaPct)} MoM`}
                  positive={m.conversions.totalDeltaPct >= 0}
                />
              </View>
              <View style={s.coverKpiCard}>
                <Text style={s.coverKpiLabel}>AVG. POSITION</Text>
                <Text style={s.coverKpiValue}>{m.search.avgPosition}</Text>
                <DeltaBadge
                  s={s}
                  label={`${posDeltaStr} pos`}
                  positive={m.search.avgPositionDelta <= 0}
                />
              </View>
            </View>

            <View style={s.coverTocBox}>
              <Text style={s.coverTocTitle}>INSIDE THIS REPORT</Text>
              <View style={s.coverTocRow}>
                {tocSections.map((item) => (
                  <Text key={item} style={[s.coverTocItem, { width: "46%" }]}>
                    {item}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          <View style={s.coverMetaGrid}>
            <View style={s.coverMetaCol}>
              <Text style={s.coverMetaLabel}>PREPARED FOR</Text>
              <Text style={s.coverMetaValue}>{data.clientName}</Text>
              <Text style={s.coverMetaSub}>{data.clientDomain}</Text>
            </View>
            <View style={s.coverMetaCol}>
              <Text style={s.coverMetaLabel}>PREPARED BY</Text>
              <Text style={s.coverMetaValue}>{data.agencyName}</Text>
              <Text style={s.coverMetaSub}>Search &amp; Organic Growth</Text>
            </View>
            <View style={s.coverMetaCol}>
              <Text style={s.coverMetaLabel}>REPORTING PERIOD</Text>
              <Text style={s.coverMetaValue}>{period}</Text>
              <Text style={s.coverMetaSub}>{providerLabel}</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* ── PAGE 2: EXECUTIVE SUMMARY ── */}
      <Page size="A4" style={s.page}>
        <Watermark show={data.watermark} s={s} />
        <PageChrome s={s} data={data} period={period} />

        <SectionHeading
          s={s}
          eyebrow="01 / EXECUTIVE BRIEF"
          title="Executive Summary"
          subtitle={`Performance synthesis connecting completed SEO initiatives to organic traffic, search visibility, and conversion outcomes for ${period}.`}
        />

        <View style={s.calloutCard}>
          <Text style={s.calloutTitle}>HEADLINE METRICS AT A GLANCE</Text>
          <View style={s.calloutGrid}>
            <View style={s.calloutStat}>
              <Text style={s.calloutStatLabel}>Sessions</Text>
              <Text style={s.calloutStatVal}>
                {formatNumber(m.organic.sessions)} ({formatPct(m.organic.sessionsDeltaPct)})
              </Text>
            </View>
            <View style={s.calloutStat}>
              <Text style={s.calloutStatLabel}>Search Clicks</Text>
              <Text style={s.calloutStatVal}>
                {formatNumber(m.search.clicks)} ({formatPct(m.search.clicksDeltaPct)})
              </Text>
            </View>
            <View style={s.calloutStat}>
              <Text style={s.calloutStatLabel}>Conversions</Text>
              <Text style={s.calloutStatVal}>
                {formatNumber(m.conversions.total)} ({formatPct(m.conversions.totalDeltaPct)})
              </Text>
            </View>
          </View>
        </View>

        {paragraphs.length > 0 ? (
          paragraphs.map((p, idx) => (
            <Text key={idx} style={s.paragraph}>
              {p}
            </Text>
          ))
        ) : (
          <Text style={s.paragraph}>No executive narrative provided for this reporting period.</Text>
        )}

        <View style={s.summaryNoteBox} wrap={false}>
          <Text style={s.summaryNoteTitle}>Methodology &amp; Attribution Note</Text>
          <Text style={s.summaryNoteText}>
            Month-over-month comparisons evaluate {period} against the prior billing period across connected analytics and search properties. Logged work items indicate deliverables shipped during this window and are evaluated directionally alongside search demand shifts.
          </Text>
        </View>
      </Page>

      {/* ── PAGE 3: ORGANIC & SEARCH PERFORMANCE ── */}
      <Page size="A4" style={s.page}>
        <Watermark show={data.watermark} s={s} />
        <PageChrome s={s} data={data} period={period} />

        <SectionHeading
          s={s}
          eyebrow="02 / SEARCH & TRAFFIC"
          title="Organic Performance"
          subtitle="Acquisition volume from Google Analytics 4 paired with search demand and ranking visibility from Google Search Console."
        />

        <Text style={s.h2}>Website Engagement (Google Analytics 4)</Text>
        <View style={s.metricRow}>
          <View style={s.metricCard}>
            <Text style={s.metricLabel}>ORGANIC SESSIONS</Text>
            <Text style={s.metricValue}>{formatNumber(m.organic.sessions)}</Text>
            <DeltaBadge
              s={s}
              label={`${formatPct(m.organic.sessionsDeltaPct)} vs prior`}
              positive={m.organic.sessionsDeltaPct >= 0}
            />
          </View>
          <View style={s.metricCard}>
            <Text style={s.metricLabel}>ACTIVE USERS</Text>
            <Text style={s.metricValue}>{formatNumber(m.organic.users)}</Text>
            <DeltaBadge
              s={s}
              label={`${formatPct(m.organic.usersDeltaPct)} vs prior`}
              positive={m.organic.usersDeltaPct >= 0}
            />
          </View>
          <View style={s.metricCard}>
            <Text style={s.metricLabel}>PAGEVIEWS</Text>
            <Text style={s.metricValue}>{formatNumber(m.organic.pageviews)}</Text>
            <DeltaBadge
              s={s}
              label={`${formatPct(m.organic.pageviewsDeltaPct)} vs prior`}
              positive={m.organic.pageviewsDeltaPct >= 0}
            />
          </View>
        </View>

        <Text style={s.h2}>Search Visibility (Google Search Console)</Text>
        <View style={s.metricRow}>
          <View style={s.metricCard}>
            <Text style={s.metricLabel}>CLICKS</Text>
            <Text style={s.metricValue}>{formatNumber(m.search.clicks)}</Text>
            <DeltaBadge
              s={s}
              label={formatPct(m.search.clicksDeltaPct)}
              positive={m.search.clicksDeltaPct >= 0}
            />
          </View>
          <View style={s.metricCard}>
            <Text style={s.metricLabel}>IMPRESSIONS</Text>
            <Text style={s.metricValue}>{formatNumber(m.search.impressions)}</Text>
            <DeltaBadge
              s={s}
              label={formatPct(m.search.impressionsDeltaPct)}
              positive={m.search.impressionsDeltaPct >= 0}
            />
          </View>
          <View style={s.metricCard}>
            <Text style={s.metricLabel}>AVG. CTR</Text>
            <Text style={s.metricValue}>{m.search.ctr}%</Text>
            <DeltaBadge
              s={s}
              label={formatPct(m.search.ctrDeltaPct)}
              positive={m.search.ctrDeltaPct >= 0}
            />
          </View>
          <View style={s.metricCard}>
            <Text style={s.metricLabel}>AVG. POSITION</Text>
            <Text style={s.metricValue}>{m.search.avgPosition}</Text>
            <DeltaBadge
              s={s}
              label={`${posDeltaStr} pos`}
              positive={m.search.avgPositionDelta <= 0}
            />
          </View>
        </View>

        <Text style={s.h2}>Top Organic Queries</Text>
        <View style={s.chartBox} wrap={false}>
          <Text style={s.chartTitle}>CLICKS DISTRIBUTION BY TOP QUERY</Text>
          <QueryClicksChart queries={m.search.topQueries} primary={primary} />
        </View>
        {data.trendHistory && data.trendHistory.length >= 2 ? (
          <View style={s.chartBox} wrap={false}>
            <Text style={s.chartTitle}>ORGANIC SESSIONS TREND (RECENT REPORTS)</Text>
            <TrendLineSvg points={data.trendHistory} primary={primary} />
          </View>
        ) : null}
        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { flex: 3 }]}>SEARCH QUERY</Text>
            <Text style={[s.tableHeaderCell, { flex: 1, textAlign: "right" }]}>CLICKS</Text>
            <Text style={[s.tableHeaderCell, { flex: 1.2, textAlign: "right" }]}>IMPRESSIONS</Text>
            <Text style={[s.tableHeaderCell, { flex: 1, textAlign: "right" }]}>AVG. POS</Text>
          </View>
          {m.search.topQueries.slice(0, 6).map((q, idx) => (
            <View
              key={q.query}
              style={idx % 2 === 1 ? [s.tableRow, s.tableRowAlt] : s.tableRow}
            >
              <Text style={[s.tableCellBold, { flex: 3 }]}>{q.query}</Text>
              <Text style={[s.tableCell, { flex: 1, textAlign: "right" }]}>
                {formatNumber(q.clicks)}
              </Text>
              <Text style={[s.tableCell, { flex: 1.2, textAlign: "right" }]}>
                {formatNumber(q.impressions)}
              </Text>
              <Text style={[s.tableCell, { flex: 1, textAlign: "right" }]}>
                #{q.position.toFixed(1)}
              </Text>
            </View>
          ))}
        </View>
      </Page>

      {/* ── PAGE 4: CONVERSIONS & GOALS ── */}
      <Page size="A4" style={s.page}>
        <Watermark show={data.watermark} s={s} />
        <PageChrome s={s} data={data} period={period} />

        <SectionHeading
          s={s}
          eyebrow="03 / CONVERSION IMPACT"
          title="Conversions & Goal Outcomes"
          subtitle="Lead and revenue-aligned actions attributed to organic search sessions during this period."
        />

        <View style={[s.metricRow, { marginBottom: 14 }]}>
          <View style={s.metricCard}>
            <Text style={s.metricLabel}>TOTAL ORGANIC CONVERSIONS</Text>
            <Text style={s.metricValue}>{formatNumber(m.conversions.total)}</Text>
            <DeltaBadge
              s={s}
              label={`${formatPct(m.conversions.totalDeltaPct)} vs prior period`}
              positive={m.conversions.totalDeltaPct >= 0}
            />
          </View>
          <View style={s.metricCard}>
            <Text style={s.metricLabel}>ORGANIC CONVERSION RATE</Text>
            <Text style={s.metricValue}>{m.conversions.rate}%</Text>
            <DeltaBadge
              s={s}
              label={`${formatPct(m.conversions.rateDeltaPct)} vs prior period`}
              positive={m.conversions.rateDeltaPct >= 0}
            />
          </View>
        </View>

        <Text style={s.h2}>Conversion Breakdown by Goal</Text>
        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { flex: 2.2 }]}>CONVERSION GOAL</Text>
            <Text style={[s.tableHeaderCell, { flex: 1.4 }]}>VOLUME SHARE</Text>
            <Text style={[s.tableHeaderCell, { flex: 0.9, textAlign: "right" }]}>COUNT</Text>
            <Text style={[s.tableHeaderCell, { flex: 1, textAlign: "right" }]}>MOM CHANGE</Text>
          </View>
          {m.conversions.goals.map((g, idx) => {
            const sharePct =
              m.conversions.total > 0
                ? Math.min(100, Math.max(4, Math.round((g.count / m.conversions.total) * 100)))
                : 0;
            return (
              <View
                key={g.name}
                style={idx % 2 === 1 ? [s.tableRow, s.tableRowAlt] : s.tableRow}
              >
                <Text style={[s.tableCellBold, { flex: 2.2 }]}>{g.name}</Text>
                <View style={{ flex: 1.4, paddingRight: 12 }}>
                  <Text style={{ fontSize: 8, color: SLATE_500 }}>{sharePct}% of total</Text>
                  <View style={s.barTrack}>
                    <View style={[s.barFill, { width: `${sharePct}%` }]} />
                  </View>
                </View>
                <Text style={[s.tableCellBold, { flex: 0.9, textAlign: "right" }]}>
                  {formatNumber(g.count)}
                </Text>
                <View style={{ flex: 1, alignItems: "flex-end" }}>
                  <DeltaBadge
                    s={s}
                    label={formatPct(g.deltaPct)}
                    positive={g.deltaPct >= 0}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </Page>

      {/* ── PAGE 5: PROOF OF WORK ── */}
      <Page size="A4" style={s.page}>
        <Watermark show={data.watermark} s={s} />
        <PageChrome s={s} data={data} period={period} />

        <SectionHeading
          s={s}
          eyebrow="04 / DELIVERABLES & EXECUTION"
          title="Completed Work Log"
          subtitle={
            data.workLogs.length > 0
              ? `${data.workLogs.length} documented ${data.workLogs.length === 1 ? "initiative" : "initiatives"}${totalHours > 0 ? ` (${totalHours.toFixed(1)} hrs logged)` : ""} executed during ${period}.`
              : `Deliverables recorded for ${period}.`
          }
        />

        {data.workLogs.length === 0 ? (
          <View style={s.summaryNoteBox}>
            <Text style={s.summaryNoteTitle}>No deliverables logged</Text>
            <Text style={s.summaryNoteText}>
              No work-log entries were recorded for this reporting period.
            </Text>
          </View>
        ) : (
          data.workLogs.map((w, i) => (
            <View key={i} style={s.workCard} wrap={false}>
              <View style={s.workHeader}>
                <View style={s.categoryBadge}>
                  <Text style={s.categoryText}>{w.category.toUpperCase()}</Text>
                </View>
                <Text style={s.workTitle}>{w.title}</Text>
                {w.hours ? (
                  <View style={s.workHoursBadge}>
                    <Text style={s.workHoursText}>{w.hours}h</Text>
                  </View>
                ) : null}
              </View>
              <Text style={s.workBody}>{w.body}</Text>
            </View>
          ))
        )}
      </Page>

      {/* ── PAGE 6: NEXT MONTH ROADMAP ── */}
      <Page size="A4" style={s.page}>
        <Watermark show={data.watermark} s={s} />
        <PageChrome s={s} data={data} period={period} />

        <SectionHeading
          s={s}
          eyebrow="05 / STRATEGIC ROADMAP"
          title="Next Month Priorities"
          subtitle="Recommended focus areas for the upcoming reporting cycle based on ranking momentum, conversion data, and technical health."
        />

        {actions.length === 0 ? (
          <View style={s.summaryNoteBox}>
            <Text style={s.summaryNoteTitle}>No actions specified</Text>
            <Text style={s.summaryNoteText}>
              Add priorities in the report editor before exporting the final client PDF.
            </Text>
          </View>
        ) : (
          actions.map((a, i) => (
            <View key={i} style={s.actionCard} wrap={false}>
              <View style={s.actionNumberBox}>
                <Text style={s.actionNumberText}>0{i + 1}</Text>
              </View>
              <View style={s.actionContent}>
                <Text style={s.actionLabel}>PRIORITY 0{i + 1}</Text>
                <Text style={s.actionText}>{a}</Text>
              </View>
            </View>
          ))
        )}

        <View style={[s.summaryNoteBox, { marginTop: 18 }]} wrap={false}>
          <Text style={s.summaryNoteTitle}>Next Review &amp; Alignment</Text>
          <Text style={s.summaryNoteText}>
            Please reply with any priority adjustments, seasonal promotions, or service focus changes so {data.agencyName} can align next month&apos;s execution schedule accordingly.
          </Text>
        </View>
      </Page>

      {/* ── PAGE 7 (CONDITIONAL): AI SEARCH MENTIONS ── */}
      {hasAi ? (
        <Page size="A4" style={s.page}>
          <Watermark show={data.watermark} s={s} />
          <PageChrome s={s} data={data} period={period} />

          <SectionHeading
            s={s}
            eyebrow="06 / AEO & AI VISIBILITY"
            title="AI Search Mentions"
            subtitle="Answer Engine Optimization (AEO) visibility snapshot evaluating how leading AI assistants reference your brand across high-intent buyer prompts."
          />

          <View style={[s.metricRow, { marginBottom: 16 }]}>
            <View style={s.metricCard}>
              <Text style={s.metricLabel}>ENGINES MONITORED</Text>
              <Text style={s.metricValue}>{data.aiMentions!.length}</Text>
            </View>
            <View style={s.metricCard}>
              <Text style={s.metricLabel}>BRAND MENTIONS</Text>
              <Text style={s.metricValue}>
                {aiMentionedCount} / {data.aiMentions!.length}
              </Text>
            </View>
            <View style={s.metricCard}>
              <Text style={s.metricLabel}>VISIBILITY RATE</Text>
              <Text style={s.metricValue}>
                {Math.round((aiMentionedCount / data.aiMentions!.length) * 100)}%
              </Text>
            </View>
          </View>

          {data.aiMentions!.map((mrow, i) => (
            <View key={i} style={s.aiCard} wrap={false}>
              <View style={s.aiCardHeader}>
                <Text style={s.aiEngineName}>
                  {mrow.engine.charAt(0).toUpperCase() + mrow.engine.slice(1)}
                </Text>
                <DeltaBadge
                  s={s}
                  label={mrow.mentioned ? "BRAND MENTIONED" : "NOT MENTIONED"}
                  positive={mrow.mentioned}
                />
              </View>
              <View style={s.aiPromptBox}>
                <Text style={s.aiPromptText}>Prompt: &ldquo;{mrow.prompt}&rdquo;</Text>
              </View>
              {mrow.citations?.length ? (
                <Text style={s.aiCitationText}>
                  Citations: {mrow.citations.join("  ·  ")}
                </Text>
              ) : (
                <Text style={[s.aiCitationText, { color: SLATE_400 }]}>
                  No brand citations returned for this prompt.
                </Text>
              )}
            </View>
          ))}
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
    const resolvedLogoUri = data.resolvedLogoUri ?? (await resolveLogoDataUri(data.logoUrl));
    const buffer = await renderToBuffer(<ReportDocument {...data} resolvedLogoUri={resolvedLogoUri} />);
    return Buffer.from(buffer);
  },
};
