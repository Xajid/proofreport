"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/card";
import { formatNumber, formatPct, periodLabel } from "@/lib/utils";
import type { MetricsSnapshot } from "@/types/metrics";

type Report = {
  id: string;
  status: string;
  narrative: string | null;
  nextActionsJson: string | null;
  metricsJson: string | null;
  periodStart: string;
  periodEnd: string;
  watermark: boolean;
  isSample: boolean;
  client: { name: string; domain: string; aiMentionsEnabled: boolean };
};

export function ReportEditor({ report: initial }: { report: Report }) {
  const [report, setReport] = useState(initial);
  const [narrative, setNarrative] = useState(initial.narrative || "");
  const [actions, setActions] = useState<string[]>(
    initial.nextActionsJson ? JSON.parse(initial.nextActionsJson) : ["", "", ""]
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

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
    setMsg(status === "ready" ? "Marked ready for delivery" : "Draft saved");
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
    setMsg(`Generated via ${data.narrativeSource || "template"}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/app" className="text-sm font-medium text-teal-800 hover:underline">
            ← Overview
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl font-semibold text-slate-950">
              {report.client.name}
            </h1>
            <Badge
              tone={
                report.status === "ready" ? "success" : report.status === "generating" ? "warning" : "neutral"
              }
            >
              {report.status}
            </Badge>
            {report.watermark ? <Badge tone="warning">watermarked</Badge> : null}
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {periodLabel(report.periodStart, report.periodEnd)} · {report.client.domain}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={regenerate} disabled={saving}>
            Regenerate
          </Button>
          <Button variant="secondary" onClick={() => save()} disabled={saving}>
            Save edits
          </Button>
          <Button onClick={() => save("ready")} disabled={saving}>
            Mark ready
          </Button>
          <a href={`/api/reports/${report.id}/pdf`} target="_blank" rel="noreferrer">
            <Button variant="soft">Download PDF</Button>
          </a>
        </div>
      </div>

      {msg ? (
        <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
          {msg}
        </div>
      ) : null}

      {metrics ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Sessions", metrics.organic.sessions, metrics.organic.sessionsDeltaPct, false],
            ["Clicks", metrics.search.clicks, metrics.search.clicksDeltaPct, false],
            ["Conversions", metrics.conversions.total, metrics.conversions.totalDeltaPct, false],
            ["Avg position", metrics.search.avgPosition, metrics.search.avgPositionDelta, true],
          ].map(([label, value, delta, absolute]) => (
            <div key={label as string} className="panel p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {label as string}
              </p>
              <p className="mt-2 font-display text-2xl font-semibold text-slate-950">
                {absolute ? value : formatNumber(value as number)}
              </p>
              <p
                className={`mt-1 text-xs font-semibold ${
                  (delta as number) >= 0 ? "text-emerald-700" : "text-amber-700"
                }`}
              >
                {absolute
                  ? `${(delta as number) >= 0 ? "+" : ""}${delta}`
                  : formatPct(delta as number)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="panel p-6 text-sm text-slate-600">
          No metrics yet — click <strong>Regenerate</strong> to pull the period snapshot.
        </div>
      )}

      <section className="panel p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Executive narrative</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Client-safe summary citing metric deltas and logged work.
            </p>
          </div>
        </div>
        <Textarea
          className="mt-4 min-h-[180px]"
          value={narrative}
          onChange={(e) => setNarrative(e.target.value)}
        />
      </section>

      <section className="panel p-5">
        <h2 className="text-sm font-semibold text-slate-900">Next month actions</h2>
        <p className="mt-0.5 text-sm text-slate-500">Edit these before generating the PDF.</p>
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Action {i + 1}
              </p>
              <Textarea
                value={actions[i] || ""}
                onChange={(e) => {
                  const next = [...actions];
                  next[i] = e.target.value;
                  setActions(next);
                }}
                placeholder={`Action ${i + 1}`}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
