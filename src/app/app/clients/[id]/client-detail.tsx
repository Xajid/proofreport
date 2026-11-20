"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format, formatISO, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/card";
import { formatNumber, periodLabel } from "@/lib/utils";
import { getLimits } from "@/lib/plan";
import type { MetricsSnapshot } from "@/types/metrics";
import {
  ArrowLeft,
  FileText,
  Globe,
  Zap,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  CheckCircle2,
  XCircle,
  Calendar,
  History,
  ArrowUpRight,
  Sparkles,
  Bot,
  PlugZap,
  ClipboardList,
  Settings2,
  Clock,
  TrendingUp,
} from "lucide-react";

type PropertyCandidate = { id: string; label: string };

type Connection = {
  id: string;
  type: string;
  provider: string;
  displayName: string | null;
  externalId: string | null;
  metaJson?: string | null;
};

type WorkLog = {
  id: string;
  title: string;
  body: string;
  category: string;
  hours: number | null;
  periodStart: string;
  periodEnd: string;
};

type ReportRun = {
  id: string;
  status: string;
  metricsJson?: string | null;
  periodStart: string;
  periodEnd: string;
};

type AiMention = {
  id: string;
  engine: string;
  mentioned: boolean;
  prompt: string;
  checkedAt?: string;
  source?: string;
  citations?: string[];
};

type Client = {
  id: string;
  name: string;
  domain: string;
  contactEmail: string | null;
  aiMentionsEnabled: boolean;
  connections: Connection[];
  workLogs: WorkLog[];
  reportRuns: ReportRun[];
  aiMentions: AiMention[];
};

const CATEGORIES = ["seo", "content", "technical", "links", "other"] as const;

export function ClientDetail({
  client: initial,
  googleConfigured = false,
  plan = "trial",
  clientSlots,
  trialExpired = false,
}: {
  client: Client;
  googleConfigured?: boolean;
  plan?: string;
  clientSlots?: number;
  trialExpired?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthParam = searchParams.get("oauth");
  const limits = getLimits(plan, {
    plan,
    clientSlots: plan === "agency" ? null : clientSlots,
    trialEndsAt: trialExpired ? new Date(0) : null,
  });

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const ref = subMonths(new Date(), i);
      const start = startOfMonth(ref);
      const end = endOfMonth(ref);
      return {
        key: format(start, "yyyy-MM"),
        label: format(start, "MMMM yyyy"),
        start: formatISO(start, { representation: "date" }),
        end: formatISO(end, { representation: "date" }),
      };
    });
  }, []);

  const [client, setClient] = useState(initial);
  const [periodStart, setPeriodStart] = useState(monthOptions[1]?.start ?? monthOptions[0].start);
  const [periodEnd, setPeriodEnd] = useState(monthOptions[1]?.end ?? monthOptions[0].end);
  const [customDates, setCustomDates] = useState(false);

  const [logForm, setLogForm] = useState({ title: "", body: "", category: "seo", hours: "" });
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editLogForm, setEditLogForm] = useState({ title: "", body: "", category: "seo", hours: "" });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [clientForm, setClientForm] = useState({
    name: initial.name,
    domain: initial.domain,
    contactEmail: initial.contactEmail || "",
  });

  const [customPrompt, setCustomPrompt] = useState("");
  const [busy, setBusy] = useState("");
  const [propertyPick, setPropertyPick] = useState<Record<string, string>>({});
  const [message, setMessage] = useState(
    oauthParam === "not_configured"
      ? "Google OAuth is not configured on this server. Demo connect still works and is labeled as a demo snapshot."
      : oauthParam?.startsWith("connected_")
      ? `Connected ${oauthParam.replace("connected_", "").toUpperCase()}. That property will be used on the next draft.`
      : oauthParam === "select_ga4"
      ? "Google Analytics is connected. Choose the GA4 property below before generating."
      : oauthParam === "select_gsc"
      ? "Search Console is connected. Choose the site below before generating."
      : oauthParam === "no_ga4_properties"
      ? "Google signed in, but no GA4 properties were returned for this account."
      : oauthParam === "no_gsc_sites"
      ? "Google signed in, but no Search Console sites were returned for this account."
      : oauthParam === "token_failed"
      ? "Google did not return a token. Try connecting again."
      : ""
  );

  const totalHours = useMemo(
    () => client.workLogs.reduce((sum, w) => sum + (w.hours || 0), 0),
    [client.workLogs]
  );

  const trendPoints = useMemo(() => {
    return [...client.reportRuns]
      .filter((r) => r.metricsJson)
      .reverse()
      .slice(-6)
      .map((r) => {
        const snap = JSON.parse(r.metricsJson!) as MetricsSnapshot;
        return {
          id: r.id,
          label: new Date(r.periodStart).toLocaleDateString("en-US", { month: "short" }),
          sessions: snap.organic.sessions,
          clicks: snap.search.clicks,
          conversions: snap.conversions.total,
        };
      });
  }, [client.reportRuns]);

  async function refresh() {
    const res = await fetch(`/api/clients/${client.id}`);
    const data = await res.json();
    setClient({
      ...data,
      aiMentions: (data.aiMentions || []).map((row: AiMention & { citationsJson?: string | null }) => ({
        ...row,
        citations:
          row.citations ??
          (row.citationsJson ? (JSON.parse(row.citationsJson) as string[]) : []),
      })),
    });
    router.refresh();
  }

  async function connectDemo(type: "ga4" | "gsc") {
    setBusy(`connect-${type}`);
    await fetch("/api/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: client.id, type, provider: "mock" }),
    });
    setBusy("");
    setMessage(`${type.toUpperCase()} connected with demo provider ✓`);
    await refresh();
  }

  function candidatesFor(conn: Connection): PropertyCandidate[] {
    if (!conn.metaJson) return [];
    try {
      const meta = JSON.parse(conn.metaJson) as { candidates?: PropertyCandidate[] };
      return meta.candidates ?? [];
    } catch {
      return [];
    }
  }

  async function saveProperty(type: "ga4" | "gsc", externalId: string) {
    if (!externalId) {
      setMessage("Choose a property first.");
      return;
    }
    setBusy(`prop-${type}`);
    const res = await fetch("/api/connections/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: client.id, type, externalId }),
    });
    const data = await res.json();
    setBusy("");
    if (!res.ok) {
      setMessage(data.error || "Could not save that property");
      return;
    }
    setMessage(`${type === "ga4" ? "GA4" : "Search Console"} property saved.`);
    await refresh();
  }

  async function addWorkLog(e: React.FormEvent) {
    e.preventDefault();
    setBusy("log");
    const parsedHours = logForm.hours.trim() ? Number(logForm.hours) : null;
    await fetch("/api/work-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: client.id,
        periodStart,
        periodEnd,
        title: logForm.title,
        body: logForm.body,
        category: logForm.category,
        hours: Number.isFinite(parsedHours) ? parsedHours : null,
      }),
    });
    setLogForm({ title: "", body: "", category: "seo", hours: "" });
    setBusy("");
    await refresh();
  }

  function startEditLog(w: WorkLog) {
    setEditingLogId(w.id);
    setEditLogForm({
      title: w.title,
      body: w.body,
      category: w.category,
      hours: w.hours != null ? String(w.hours) : "",
    });
  }

  async function saveEditLog(id: string) {
    setBusy(`edit-${id}`);
    const parsedHours = editLogForm.hours.trim() ? Number(editLogForm.hours) : null;
    await fetch(`/api/work-logs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editLogForm.title,
        body: editLogForm.body,
        category: editLogForm.category,
        hours: Number.isFinite(parsedHours) ? parsedHours : null,
      }),
    });
    setEditingLogId(null);
    setBusy("");
    await refresh();
  }

  async function deleteLog(id: string) {
    await fetch(`/api/work-logs/${id}`, { method: "DELETE" });
    await refresh();
  }

  async function generateNow() {
    setBusy("generate");
    setMessage("");
    const create = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: client.id,
        periodStart,
        periodEnd,
      }),
    });
    const report = await create.json();
    if (!create.ok) {
      setBusy("");
      setMessage(report.error || "Failed to create report");
      return;
    }
    const gen = await fetch(`/api/reports/${report.id}/generate`, { method: "POST" });
    const data = await gen.json();
    setBusy("");
    if (!gen.ok) {
      setMessage(data.error || "Generation failed");
      return;
    }
    router.push(`/app/reports/${report.id}`);
  }

  async function saveClientSettings(e: React.FormEvent) {
    e.preventDefault();
    setBusy("save-client");
    const res = await fetch(`/api/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientForm),
    });
    const data = await res.json();
    setBusy("");
    if (!res.ok) {
      setMessage(data.error || "Update failed");
      return;
    }
    setClient({ ...client, ...data });
    setSettingsOpen(false);
    setMessage("Client details updated ✓");
    router.refresh();
  }

  async function deleteClient() {
    if (!window.confirm(`Delete ${client.name} and all its reports and work logs?`)) return;
    setBusy("delete-client");
    const res = await fetch(`/api/clients/${client.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/app/clients");
      router.refresh();
    } else {
      setBusy("");
      setMessage("Failed to delete client");
    }
  }

  async function toggleAiMentions() {
    const res = await fetch(`/api/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: client.name,
        domain: client.domain,
        contactEmail: client.contactEmail || "",
        aiMentionsEnabled: !client.aiMentionsEnabled,
      }),
    });
    const data = await res.json();
    setClient({ ...client, aiMentionsEnabled: data.aiMentionsEnabled });
  }

  async function seedAiMentions() {
    setBusy("ai");
    const res = await fetch("/api/ai-mentions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: client.id, customPrompt }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy("");
    if (!res.ok) {
      setMessage(data.error || "The model check failed. Nothing was saved.");
      return;
    }
    setCustomPrompt("");
    setMessage("Live check saved. The prompt, model, and any URLs from the answer are stored.");
    await refresh();
  }

  async function deleteAiMention(id: string) {
    await fetch(`/api/ai-mentions?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await refresh();
  }

  const ga4 = client.connections.find((c) => c.type === "ga4");
  const gsc = client.connections.find((c) => c.type === "gsc");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/app/clients"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-teal-700 transition-colors mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Clients
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-teal-100 to-teal-50 border border-teal-200/60 text-teal-800 font-bold text-lg">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
                  {client.name}
                </h1>
                {client.aiMentionsEnabled && (
                  <Badge tone="brand">
                    <Sparkles className="h-3 w-3" />
                    AI mentions
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5 font-mono">
                  <Globe className="h-3.5 w-3.5 text-slate-400" />
                  {client.domain}
                </span>
                {client.contactEmail && (
                  <>
                    <span>·</span>
                    <span>{client.contactEmail}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="default"
            onClick={() => setSettingsOpen(!settingsOpen)}
          >
            <Settings2 className="h-4 w-4" />
            Edit client
          </Button>
          <Button onClick={generateNow} disabled={!!busy} size="default">
            {busy === "generate" ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Generating…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Generate report
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Toast */}
      {message && (
        <div className="toast-info rounded-[9px] px-4 py-3 text-sm font-medium animate-scale-in">
          {message}
        </div>
      )}

      {/* ── Edit Client Settings Drawer ── */}
      {settingsOpen && (
        <form
          onSubmit={saveClientSettings}
          className="panel p-5 space-y-4 animate-scale-in border-teal-200/70"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Client details</h2>
            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Client name</Label>
              <Input
                value={clientForm.name}
                onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Domain</Label>
              <Input
                value={clientForm.domain}
                onChange={(e) => setClientForm({ ...clientForm, domain: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Contact email</Label>
              <Input
                type="email"
                value={clientForm.contactEmail}
                onChange={(e) => setClientForm({ ...clientForm, contactEmail: e.target.value })}
                placeholder="owner@client.com"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost-danger"
              size="sm"
              onClick={deleteClient}
              disabled={!!busy}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete client
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setSettingsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={busy === "save-client"}>
                Save changes
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* ── Connections + Reporting Period Selector ── */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[var(--radius)] border border-slate-200/80 bg-white shadow-[var(--shadow-sm)] overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-3.5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <PlugZap className="h-4 w-4 text-slate-400" />
                Data connections
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {googleConfigured
                  ? "Google OAuth ready — connect live GA4 / Search Console or demo mode."
                  : "Demo metrics active; set GOOGLE_CLIENT_* env vars for live Google OAuth."}
              </p>
            </div>
            <Badge tone={googleConfigured ? "success" : "neutral"} dot>
              {googleConfigured ? "OAuth ready" : "Demo-ready"}
            </Badge>
          </div>
          <div className="p-4 space-y-2.5">
            {[
              { key: "ga4" as const, label: "Google Analytics 4", conn: ga4 },
              { key: "gsc" as const, label: "Search Console", conn: gsc },
            ].map((row) => (
              <div
                key={row.key}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[9px] border border-slate-200/80 bg-slate-50/60 px-3.5 py-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] border text-xs font-bold ${
                      row.conn
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-slate-100 border-slate-200 text-slate-500"
                    }`}
                  >
                    {row.key === "ga4" ? "G4" : "SC"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{row.label}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {row.conn?.provider === "google" && !row.conn.externalId ? (
                        <>
                          <XCircle className="h-3 w-3 text-amber-500 shrink-0" />
                          <span className="text-xs text-amber-700">Connected — choose a property</span>
                        </>
                      ) : row.conn ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                          <span className="text-xs text-slate-500 truncate">
                            {row.conn.displayName} · {row.conn.provider}
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 text-slate-300 shrink-0" />
                          <span className="text-xs text-slate-400">Not connected</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {row.conn?.provider === "google" && candidatesFor(row.conn).length > 0 && (
                  <div className="flex w-full flex-wrap items-end gap-2">
                    <label className="min-w-[12rem] flex-1 text-xs font-medium text-slate-600">
                      Property
                      <select
                        className="mt-1 h-9 w-full rounded-[8px] border border-slate-200 bg-white px-2 text-sm text-slate-900"
                        value={propertyPick[row.key] || row.conn.externalId || ""}
                        onChange={(e) => setPropertyPick((prev) => ({ ...prev, [row.key]: e.target.value }))}
                      >
                        <option value="">Choose a property</option>
                        {candidatesFor(row.conn).map((candidate) => (
                          <option key={candidate.id} value={candidate.id}>
                            {candidate.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Button
                      size="sm"
                      type="button"
                      onClick={() => saveProperty(row.key, propertyPick[row.key] || row.conn?.externalId || "")}
                      disabled={!!busy}
                    >
                      Use property
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  {googleConfigured && (
                    <a href={`/api/integrations/google/start?clientId=${client.id}&type=${row.key}`}>
                      <Button size="sm" variant="soft" type="button">
                        Google OAuth
                      </Button>
                    </a>
                  )}
                  <Button
                    size="sm"
                    variant={row.conn ? "outline" : "soft"}
                    onClick={() => connectDemo(row.key)}
                    disabled={!!busy}
                  >
                    {row.conn ? "Reconnect demo" : "Demo connect"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reporting Period Picker */}
        <div className="rounded-[var(--radius)] border border-slate-200/80 bg-white shadow-[var(--shadow-sm)] overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-3.5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                Reporting period
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Used for new work logs and report generation.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCustomDates(!customDates)}
              className="text-xs font-semibold text-teal-700 hover:underline"
            >
              {customDates ? "Use month preset" : "Custom dates"}
            </button>
          </div>
          <div className="p-4 space-y-3">
            {!customDates ? (
              <div className="space-y-1.5">
                <Label>Select month</Label>
                <select
                  className="h-9 w-full rounded-[8px] border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-[var(--shadow-xs)] focus:border-[var(--brand)] focus:outline-none focus:ring-3 focus:ring-[var(--brand-mist)]"
                  value={`${periodStart}|${periodEnd}`}
                  onChange={(e) => {
                    const [s, en] = e.target.value.split("|");
                    setPeriodStart(s);
                    setPeriodEnd(en);
                  }}
                >
                  {monthOptions.map((m) => (
                    <option key={m.key} value={`${m.start}|${m.end}`}>
                      {m.label} ({m.start} – {m.end})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Start date</Label>
                  <Input
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>End date</Label>
                  <Input
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                  />
                </div>
              </div>
            )}
            <div className="rounded-[9px] border border-dashed border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-600">
              Active window: <span className="font-semibold text-slate-800">{periodStart}</span> to{" "}
              <span className="font-semibold text-slate-800">{periodEnd}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Historical Trend Chart (when >= 2 generated reports exist) ── */}
      {trendPoints.length >= 2 && (
        <div className="rounded-[var(--radius)] border border-slate-200/80 bg-white p-5 shadow-[var(--shadow-sm)]">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-teal-600" />
                Performance history
              </h2>
              <p className="text-xs text-slate-500">Organic sessions &amp; clicks across generated periods</p>
            </div>
            <Badge tone="neutral">{trendPoints.length} periods</Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-6">
            {trendPoints.map((pt) => {
              const maxSess = Math.max(...trendPoints.map((p) => p.sessions), 1);
              const pct = Math.max(12, Math.round((pt.sessions / maxSess) * 100));
              return (
                <Link
                  key={pt.id}
                  href={`/app/reports/${pt.id}`}
                  className="group rounded-[8px] border border-slate-100 bg-slate-50/60 p-3 hover:border-teal-200 hover:bg-teal-50/30 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>{pt.label}</span>
                    <ArrowUpRight className="h-3 w-3 text-slate-300 group-hover:text-teal-600" />
                  </div>
                  <p className="mt-1 font-display text-lg font-bold text-slate-900">
                    {formatNumber(pt.sessions)}
                  </p>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-teal-600 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    {formatNumber(pt.clicks)} clicks · {pt.conversions} conv
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Work log + Sidebar ── */}
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[var(--radius)] border border-slate-200/80 bg-white shadow-[var(--shadow-sm)] overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-slate-400" />
                Work log
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Proof bullets for the selected period.</p>
            </div>
            <div className="flex items-center gap-2">
              {totalHours > 0 && (
                <Badge tone="brand">
                  <Clock className="h-3 w-3" />
                  {totalHours.toFixed(1)}h logged
                </Badge>
              )}
              <Badge tone="neutral">
                {client.workLogs.length} {client.workLogs.length === 1 ? "entry" : "entries"}
              </Badge>
            </div>
          </div>

          <form onSubmit={addWorkLog} className="p-5 border-b border-slate-100 space-y-3 bg-slate-50/40">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                value={logForm.title}
                onChange={(e) => setLogForm({ ...logForm, title: e.target.value })}
                placeholder="e.g. Refreshed service landing pages"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Details</Label>
              <Textarea
                value={logForm.body}
                onChange={(e) => setLogForm({ ...logForm, body: e.target.value })}
                placeholder="What changed, and why it matters to the client"
                className="min-h-[84px]"
                required
              />
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[130px] flex-1 space-y-1.5">
                <Label>Category</Label>
                <select
                  className="h-9 w-full rounded-[8px] border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-[var(--shadow-xs)] focus:border-[var(--brand)] focus:outline-none focus:ring-3 focus:ring-[var(--brand-mist)] hover:border-slate-300 transition-all"
                  value={logForm.category}
                  onChange={(e) => setLogForm({ ...logForm, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-28 space-y-1.5">
                <Label>Hours</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="e.g. 2.5"
                  value={logForm.hours}
                  onChange={(e) => setLogForm({ ...logForm, hours: e.target.value })}
                />
              </div>
              <Button size="sm" disabled={busy === "log"} type="submit">
                <Plus className="h-3.5 w-3.5" />
                Add entry
              </Button>
            </div>
          </form>

          <div className="p-4">
            {client.workLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <div className="rounded-full bg-slate-100 p-3">
                  <ClipboardList className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">No work logged yet.</p>
                <p className="text-xs text-slate-400">Add entries above to build your report narrative.</p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {client.workLogs.map((w) => {
                  const isEditing = editingLogId === w.id;
                  return (
                    <li
                      key={w.id}
                      className="group rounded-[9px] border border-slate-200/80 bg-white p-3.5 shadow-[var(--shadow-xs)] transition-shadow hover:shadow-[var(--shadow-sm)]"
                    >
                      {isEditing ? (
                        <div className="space-y-2.5">
                          <Input
                            value={editLogForm.title}
                            onChange={(e) => setEditLogForm({ ...editLogForm, title: e.target.value })}
                          />
                          <Textarea
                            className="min-h-[72px]"
                            value={editLogForm.body}
                            onChange={(e) => setEditLogForm({ ...editLogForm, body: e.target.value })}
                          />
                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              className="h-8 rounded-[7px] border border-slate-200 bg-white px-2.5 text-xs text-slate-800"
                              value={editLogForm.category}
                              onChange={(e) =>
                                setEditLogForm({ ...editLogForm, category: e.target.value })
                              }
                            >
                              {CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                            <Input
                              type="number"
                              step="0.5"
                              min="0"
                              placeholder="Hours"
                              className="h-8 w-24 text-xs"
                              value={editLogForm.hours}
                              onChange={(e) =>
                                setEditLogForm({ ...editLogForm, hours: e.target.value })
                              }
                            />
                            <div className="ml-auto flex gap-1.5">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingLogId(null)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => saveEditLog(w.id)}
                                disabled={busy === `edit-${w.id}`}
                              >
                                <Check className="h-3.5 w-3.5" />
                                Save
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <Badge tone="brand">{w.category}</Badge>
                              <p className="text-sm font-semibold text-slate-900">{w.title}</p>
                              {w.hours != null && (
                                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600">
                                  {w.hours}h
                                </span>
                              )}
                            </div>
                            <p className="text-sm leading-relaxed text-slate-600">{w.body}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => startEditLog(w)}
                              className="rounded-[6px] p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                              title="Edit entry"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteLog(w.id)}
                              className="rounded-[6px] p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500"
                              title="Delete entry"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <div className="rounded-[var(--radius)] border border-slate-200/80 bg-white shadow-[var(--shadow-sm)] overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-3.5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Bot className="h-4 w-4 text-slate-400" />
                  AI mentions
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  A live check stores the prompt, the model, the time, and any URLs written in the answer.
                </p>
              </div>
              {!limits.aiMentions ? (
                <Link href="/pricing">
                  <Button size="sm" variant="outline" className="text-amber-800 border-amber-300 bg-amber-50 hover:bg-amber-100">
                    <Zap className="h-3 w-3 mr-1 text-amber-600" />
                    Upgrade to unlock
                  </Button>
                </Link>
              ) : (
                <Button
                  size="sm"
                  variant={client.aiMentionsEnabled ? "soft" : "outline"}
                  onClick={toggleAiMentions}
                >
                  {client.aiMentionsEnabled ? (
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      Enabled
                    </span>
                  ) : (
                    "Enable"
                  )}
                </Button>
              )}
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-2">
                {!limits.aiMentions && (
                  <p className="text-xs leading-relaxed text-slate-500">
                    You can run a check on the trial. The row is added to the client PDF after you upgrade and enable it.
                  </p>
                )}
                <Input
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Buyer question, or leave blank for a default"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={seedAiMentions}
                  disabled={busy === "ai"}
                  className="w-full"
                >
                  {busy === "ai" ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Asking the model…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5" />
                      Run live check
                    </span>
                  )}
                </Button>
              </div>

              {client.aiMentions.length > 0 ? (
                <ul className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
                  {client.aiMentions.map((a) => (
                    <li
                      key={a.id}
                      className="group rounded-[8px] border border-slate-200/80 bg-slate-50/60 px-3 py-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Bot className="h-3.5 w-3.5 text-slate-400" />
                          <span
                            className={`text-sm font-semibold text-slate-800 ${a.engine.includes("/") ? "" : "capitalize"}`}
                          >
                            {a.engine}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge tone={a.source === "live" ? "success" : "neutral"}>
                            {a.source === "live" ? "Live" : "Demo"}
                          </Badge>
                          <Badge tone={a.mentioned ? "success" : "neutral"} dot>
                            {a.mentioned ? "Mentioned" : "Not found"}
                          </Badge>
                          <button
                            type="button"
                            onClick={() => deleteAiMention(a.id)}
                            className="rounded p-1 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-red-500"
                            title="Delete check"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">{a.prompt}</p>
                      {a.citations && a.citations.length > 0 && (
                        <ul className="mt-1 space-y-0.5">
                          {a.citations.map((url) => (
                            <li key={url} className="truncate text-[11px] text-teal-800">
                              <a href={url} target="_blank" rel="noreferrer">
                                {url}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 text-center py-2">
                  A live check stores the model answer. Demo rows from earlier stay off the PDF.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[var(--radius)] border border-slate-200/80 bg-white shadow-[var(--shadow-sm)] overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-3.5">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <History className="h-4 w-4 text-slate-400" />
                Report history
              </h2>
            </div>
            <div className="p-2">
              {client.reportRuns.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-sm text-slate-500">No reports yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Generate your first report above.</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {client.reportRuns.map((r) => (
                    <li key={r.id}>
                      <Link
                        href={`/app/reports/${r.id}`}
                        className="group flex items-center justify-between gap-2 rounded-[8px] px-3 py-2.5 text-sm transition-colors hover:bg-slate-50"
                      >
                        <span className="text-slate-700 group-hover:text-teal-700 transition-colors font-medium text-xs">
                          {periodLabel(r.periodStart, r.periodEnd)}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            dot
                            tone={
                              r.status === "ready" || r.status === "sent"
                                ? "success"
                                : r.status === "generating"
                                ? "warning"
                                : "neutral"
                            }
                          >
                            {r.status}
                          </Badge>
                          <ArrowUpRight className="h-3 w-3 text-slate-300 group-hover:text-teal-500 transition-colors" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
