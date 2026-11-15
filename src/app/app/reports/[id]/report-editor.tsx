"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/card";
import { formatNumber, formatPct, periodLabel } from "@/lib/utils";
import type { MetricsSnapshot } from "@/types/metrics";
import {
  ArrowLeft,
  RefreshCw,
  Save,
  CheckCircle,
  Download,
  TrendingUp,
  TrendingDown,
  BarChart3,
  FileText,
  ChevronRight,
  Eye,
  EyeOff,
  Share2,
  Send,
  Trash2,
  X,
} from "lucide-react";

type Report = {
  id: string;
  clientId: string;
  status: string;
  narrative: string | null;
  nextActionsJson: string | null;
  metricsJson: string | null;
  periodStart: string;
  periodEnd: string;
  shareToken: string | null;
  sentAt: string | null;
  sentTo: string | null;
  watermark: boolean;
  isSample: boolean;
  client: {
    id: string;
    name: string;
    domain: string;
    contactEmail: string | null;
    aiMentionsEnabled: boolean;
  };
};

export function ReportEditor({ report: initial }: { report: Report }) {
  const router = useRouter();
  const [report, setReport] = useState(initial);
  const [narrative, setNarrative] = useState(initial.narrative || "");
  const [actions, setActions] = useState<string[]>(
    initial.nextActionsJson ? JSON.parse(initial.nextActionsJson) : ["", "", ""]
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewKey, setPreviewKey] = useState(1);

  const [sendOpen, setSendOpen] = useState(false);
  const [sendEmail, setSendEmail] = useState(initial.client.contactEmail || "");
  const [sendNote, setSendNote] = useState("");

  const metrics: MetricsSnapshot | null = report.metricsJson
    ? JSON.parse(report.metricsJson)
    : null;

  async function save(status?: string) {
    setSaving(true);
    const res = await fetch(`/api/reports/${report.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        narrative,
        nextActions: [actions[0] || "", actions[1] || "", actions[2] || ""],
        ...(status ? { status } : {}),
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setMsg(data.error || "Save failed");
      return;
    }
    setReport({ ...report, ...data });
    setPreviewKey((k) => k + 1);
    setMsg(status === "ready" ? "Marked ready for delivery ✓" : "Draft saved ✓");
  }

  async function regenerate() {
    setSaving(true);
    const res = await fetch(`/api/reports/${report.id}/generate`, { method: "POST" });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setMsg(data.error || "Generate failed");
      return;
    }
    setReport({ ...report, ...data });
    setNarrative(data.narrative || "");
    setActions(data.nextActionsJson ? JSON.parse(data.nextActionsJson) : ["", "", ""]);
    setPreviewKey((k) => k + 1);
    setMsg(`Generated via ${data.narrativeSource || "template"} ✓`);
  }

  async function copyShareLink() {
    setSaving(true);
    const res = await fetch(`/api/reports/${report.id}/share`, { method: "POST" });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setMsg(data.error || "Could not create share link");
      return;
    }
    setReport({ ...report, shareToken: data.shareToken });
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(data.shareUrl);
      setMsg(`Share link copied: ${data.shareUrl} ✓`);
    } else {
      setMsg(`Share link ready: ${data.shareUrl}`);
    }
  }

  async function sendToClient(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/reports/${report.id}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: sendEmail, note: sendNote }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setMsg(data.error || "Send failed");
      return;
    }
    setReport({ ...report, ...data });
    setSendOpen(false);
    setMsg(
      data.deliveryMode === "resend"
        ? `Report emailed to ${data.sentTo} ✓`
        : `Marked sent to ${data.sentTo} (add RESEND_API_KEY for live email delivery) ✓`
    );
  }

  async function deleteReport() {
    if (!window.confirm("Delete this report run permanently?")) return;
    setSaving(true);
    const res = await fetch(`/api/reports/${report.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push(`/app/clients/${report.client.id}`);
      router.refresh();
    } else {
      setSaving(false);
      setMsg("Delete failed");
    }
  }

  const metricRows = metrics
    ? [
        { label: "Organic Sessions", value: formatNumber(metrics.organic.sessions), delta: metrics.organic.sessionsDeltaPct, absolute: false },
        { label: "Search Clicks", value: formatNumber(metrics.search.clicks), delta: metrics.search.clicksDeltaPct, absolute: false },
        { label: "Conversions", value: formatNumber(metrics.conversions.total), delta: metrics.conversions.totalDeltaPct, absolute: false },
        { label: "Avg. Position", value: String(metrics.search.avgPosition), delta: metrics.search.avgPositionDelta, absolute: true },
      ]
    : [];

  const maxQueryClicks = metrics?.search.topQueries?.length
    ? Math.max(...metrics.search.topQueries.slice(0, 5).map((q) => q.clicks), 1)
    : 1;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/app/clients/${report.client.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-teal-700 transition-colors mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {report.client.name}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
              {report.client.name}
            </h1>
            <Badge
              dot
              tone={
                report.status === "ready" || report.status === "sent"
                  ? "success"
                  : report.status === "generating"
                  ? "warning"
                  : "neutral"
              }
            >
              {report.status}
            </Badge>
            {metrics && (
              <Badge tone={metrics.provider === "google" ? "accent" : "neutral"}>
                {metrics.provider === "google" ? "Live Google Data" : "Demo Snapshot"}
              </Badge>
            )}
            {report.watermark && <Badge tone="warning">watermarked</Badge>}
          </div>
          <p className="mt-1 text-sm text-slate-500 flex flex-wrap items-center gap-2">
            <span>{periodLabel(report.periodStart, report.periodEnd)}</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="font-mono">{report.client.domain}</span>
            {report.sentTo && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                <span className="text-emerald-700 font-medium">Sent to {report.sentTo}</span>
              </>
            )}
          </p>
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={regenerate} disabled={saving}>
            <RefreshCw className={`h-3.5 w-3.5 ${saving ? "animate-spin" : ""}`} />
            Regenerate
          </Button>
          <Button variant="outline" size="sm" onClick={() => save()} disabled={saving}>
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
          <Button size="sm" onClick={() => save("ready")} disabled={saving}>
            <CheckCircle className="h-3.5 w-3.5" />
            Mark ready
          </Button>
          {metrics && (
            <>
              <Button
                variant={showPreview ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showPreview ? "Hide PDF" : "Preview PDF"}
              </Button>
              <Button variant="outline" size="sm" onClick={copyShareLink} disabled={saving}>
                <Share2 className="h-3.5 w-3.5" />
                Copy link
              </Button>
              <Button variant="soft" size="sm" onClick={() => setSendOpen(!sendOpen)} disabled={saving}>
                <Send className="h-3.5 w-3.5" />
                Send
              </Button>
              <a href={`/api/reports/${report.id}/pdf`} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm">
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </Button>
              </a>
            </>
          )}
          <Button variant="ghost-danger" size="icon-sm" onClick={deleteReport} disabled={saving} title="Delete report">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Toast */}
      {msg && (
        <div
          className={`rounded-[9px] px-4 py-3 text-sm font-medium animate-scale-in ${
            msg.includes("✓") || msg.includes("Generated")
              ? "toast-success"
              : "toast-warning"
          }`}
        >
          {msg}
        </div>
      )}

      {/* Send to client drawer */}
      {sendOpen && (
        <form onSubmit={sendToClient} className="panel p-5 space-y-4 animate-scale-in border-teal-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Deliver report to client</h2>
              <p className="text-xs text-slate-500">
                Marks the report as sent, generates a share link, and emails the PDF if RESEND_API_KEY is configured.
              </p>
            </div>
            <button type="button" onClick={() => setSendOpen(false)} className="text-slate-400 hover:text-slate-700">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              type="email"
              required
              placeholder="client@domain.com"
              value={sendEmail}
              onChange={(e) => setSendEmail(e.target.value)}
            />
            <Input
              placeholder="Optional personal note…"
              value={sendNote}
              onChange={(e) => setSendNote(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setSendOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving}>
              <Send className="h-3.5 w-3.5" />
              Send report
            </Button>
          </div>
        </form>
      )}

      {/* ── Main Content (Split view when PDF preview is active) ── */}
      <div className={showPreview ? "grid gap-6 xl:grid-cols-[1.05fr_0.95fr] items-start" : "space-y-6"}>
        <div className="space-y-6">
          {/* Metric cards */}
          {metrics ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {metricRows.map(({ label, value, delta, absolute }) => {
                  const positive = absolute ? (delta as number) <= 0 : (delta as number) >= 0;
                  const TrendIcon = positive ? TrendingUp : TrendingDown;
                  return (
                    <div
                      key={label}
                      className="rounded-[var(--radius)] border border-slate-200/80 bg-white p-4 shadow-[var(--shadow-sm)] panel-hover"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                        {label}
                      </p>
                      <p className="mt-2.5 font-display text-2xl font-bold text-slate-900">{value}</p>
                      <div
                        className={`mt-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold ${
                          positive ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        <TrendIcon className="h-3 w-3" />
                        {absolute
                          ? `${(delta as number) >= 0 ? "+" : ""}${delta}`
                          : formatPct(delta as number)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Query & Goal Visual Breakdown */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="panel p-5">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Top Queries by Clicks
                  </h2>
                  <div className="mt-4 space-y-3">
                    {metrics.search.topQueries.slice(0, 5).map((q) => {
                      const pct = Math.max(8, Math.round((q.clicks / maxQueryClicks) * 100));
                      return (
                        <div key={q.query} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-800 truncate pr-2">{q.query}</span>
                            <span className="font-mono text-slate-500 shrink-0">
                              {formatNumber(q.clicks)} · #{q.position.toFixed(1)}
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full rounded-full bg-teal-600" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="panel p-5">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Conversion Goal Share
                  </h2>
                  <div className="mt-4 space-y-3">
                    {metrics.conversions.goals.map((g) => {
                      const share =
                        metrics.conversions.total > 0
                          ? Math.min(100, Math.max(5, Math.round((g.count / metrics.conversions.total) * 100)))
                          : 0;
                      return (
                        <div key={g.name} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-800">{g.name}</span>
                            <span className="font-mono text-slate-500">
                              {formatNumber(g.count)} ({share}%) · {formatPct(g.deltaPct)}
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full rounded-full bg-indigo-600" style={{ width: `${share}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-[var(--radius)] border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center">
              <BarChart3 className="mx-auto h-8 w-8 text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-600">No metrics yet</p>
              <p className="mt-1 text-xs text-slate-500">
                Click <strong>Regenerate</strong> to pull the period snapshot.
              </p>
            </div>
          )}

          {/* Executive narrative */}
          <section className="rounded-[var(--radius)] border border-slate-200/80 bg-white shadow-[var(--shadow-sm)] overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Executive narrative</h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Client-safe summary citing metric deltas and logged work.
                  </p>
                </div>
                <FileText className="h-4 w-4 text-slate-400" />
              </div>
            </div>
            <div className="p-5">
              <Textarea
                className="min-h-[200px] font-sans text-[15px] leading-7"
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                placeholder="Write an executive summary that connects your work to measurable outcomes…"
              />
            </div>
          </section>

          {/* Next actions */}
          <section className="rounded-[var(--radius)] border border-slate-200/80 bg-white shadow-[var(--shadow-sm)] overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-3.5">
              <h2 className="text-sm font-semibold text-slate-900">Next month actions</h2>
              <p className="mt-0.5 text-xs text-slate-500">Edit these before generating the PDF.</p>
            </div>
            <div className="divide-y divide-slate-100">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-start gap-4 px-5 py-4">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 border border-teal-100 text-[11px] font-bold text-teal-700 mt-1.5">
                    {i + 1}
                  </div>
                  <Textarea
                    className="min-h-[80px] flex-1"
                    value={actions[i] || ""}
                    onChange={(e) => {
                      const next = [...actions];
                      next[i] = e.target.value;
                      setActions(next);
                    }}
                    placeholder={`Describe action ${i + 1} for next month…`}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Live PDF Preview Pane */}
        {showPreview && metrics && (
          <div className="panel sticky top-6 overflow-hidden animate-slide-right">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Live PDF Preview
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setPreviewKey((k) => k + 1)}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </Button>
            </div>
            <iframe
              key={previewKey}
              src={`/api/reports/${report.id}/pdf?inline=1&v=${previewKey}`}
              className="h-[780px] w-full bg-slate-100"
              title="Live PDF report preview"
            />
          </div>
        )}
      </div>
    </div>
  );
}
