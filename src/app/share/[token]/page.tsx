import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNumber, formatPct, periodLabel } from "@/lib/utils";
import { getLimits } from "@/lib/plan";
import { liveMentions } from "@/lib/mentions";
import type { MetricsSnapshot } from "@/types/metrics";
import { Download, Globe, TrendingUp, TrendingDown, CheckCircle2, Sparkles } from "lucide-react";

export default async function PublicShareReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const report = await prisma.reportRun.findUnique({
    where: { shareToken: token },
    include: {
      client: {
        include: {
          org: true,
          workLogs: { orderBy: { createdAt: "desc" } },
          aiMentions: { orderBy: { checkedAt: "desc" }, take: 10 },
        },
      },
    },
  });

  if (!report || !report.metricsJson || !report.narrative) notFound();

  const metrics = JSON.parse(report.metricsJson) as MetricsSnapshot;
  const nextActions = report.nextActionsJson
    ? (JSON.parse(report.nextActionsJson) as string[]).filter(Boolean)
    : [];
  const periodLogs = report.client.workLogs.filter(
    (w) => w.periodStart <= report.periodEnd && w.periodEnd >= report.periodStart
  );
  const period = periodLabel(report.periodStart, report.periodEnd);
  const brandColor = report.client.org.primaryColor || "#0d6e68";
  const limits = getLimits(report.client.org.plan, report.client.org);
  const mentions = liveMentions(report.client.aiMentions);
  const shouldWatermark = limits.watermark || Boolean(report.isSample) || Boolean(report.watermark);

  const kpis = [
    { label: "Organic Sessions", value: formatNumber(metrics.organic.sessions), delta: metrics.organic.sessionsDeltaPct, abs: false },
    { label: "Search Clicks", value: formatNumber(metrics.search.clicks), delta: metrics.search.clicksDeltaPct, abs: false },
    { label: "Conversions", value: formatNumber(metrics.conversions.total), delta: metrics.conversions.totalDeltaPct, abs: false },
    { label: "Avg. Position", value: String(metrics.search.avgPosition), delta: metrics.search.avgPositionDelta, abs: true },
  ];

  return (
    <div className="min-h-screen surface-mesh">
      {shouldWatermark && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs font-semibold text-amber-800 tracking-wide uppercase">
          Sample Preview · Generated with SearchProof
        </div>
      )}
      {/* Branded top banner */}
      <header
        className="border-b border-white/10 text-white"
        style={{ background: `linear-gradient(135deg, ${brandColor}, #0d1117)` }}
      >
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-6 py-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              {report.client.org.name} · Monthly SEO Report
            </p>
            <h1 className="font-display mt-2 text-3xl font-semibold">{report.client.name}</h1>
            <p className="mt-1.5 flex items-center gap-2 text-sm text-white/80">
              <Globe className="h-3.5 w-3.5" />
              <span className="font-mono">{report.client.domain}</span>
              <span>·</span>
              <span>{period}</span>
            </p>
          </div>
          <a href={`/api/share/${token}/pdf`} target="_blank" rel="noreferrer">
            <Button variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-6 py-10">
        {/* KPIs */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => {
            const positive = k.abs ? k.delta <= 0 : k.delta >= 0;
            const Icon = positive ? TrendingUp : TrendingDown;
            return (
              <div key={k.label} className="panel p-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  {k.label}
                </p>
                <p className="mt-2 font-display text-2xl font-bold text-slate-900">{k.value}</p>
                <span
                  className={`mt-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold ${
                    positive ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {k.abs ? `${k.delta >= 0 ? "+" : ""}${k.delta}` : formatPct(k.delta)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Executive narrative */}
        <section className="panel p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
            Executive Summary
          </h2>
          <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-slate-700">
            {report.narrative.split(/\n+/).filter(Boolean).map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </section>

        {/* Work log */}
        <section className="panel p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
            Completed Work Log
          </h2>
          {periodLogs.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No work items recorded for this period.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {periodLogs.map((w) => (
                <li key={w.id} className="rounded-[9px] border border-slate-200/80 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="brand">{w.category}</Badge>
                    <p className="text-sm font-semibold text-slate-900">{w.title}</p>
                    {w.hours ? (
                      <span className="ml-auto text-xs font-medium text-slate-500">{w.hours}h</span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 text-sm text-slate-600">{w.body}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Next actions */}
        {nextActions.length > 0 && (
          <section className="panel p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              Next Month Priorities
            </h2>
            <ul className="mt-4 space-y-3">
              {nextActions.map((a, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* AI Mentions */}
        {mentions.length > 0 && (
          <section className="panel p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-slate-500">
              <Sparkles className="h-4 w-4 text-teal-600" />
              AI Search Visibility
            </h2>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {mentions.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-[8px] border border-slate-200/80 px-3.5 py-2.5"
                >
                  <span className="text-sm font-semibold capitalize text-slate-800">{m.engine}</span>
                  <Badge tone={m.mentioned ? "success" : "neutral"} dot>
                    {m.mentioned ? "Mentioned" : "Not mentioned"}
                  </Badge>
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="pt-4 text-center text-xs text-slate-400">
          Prepared by {report.client.org.name}
        </footer>
      </main>
    </div>
  );
}

