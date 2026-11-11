"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatISO, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/card";
import { periodLabel } from "@/lib/utils";

type Connection = {
  id: string;
  type: string;
  provider: string;
  displayName: string | null;
  externalId: string | null;
};

type WorkLog = {
  id: string;
  title: string;
  body: string;
  category: string;
  periodStart: string;
  periodEnd: string;
};

type ReportRun = {
  id: string;
  status: string;
  periodStart: string;
  periodEnd: string;
};

type AiMention = {
  id: string;
  engine: string;
  mentioned: boolean;
  prompt: string;
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

export function ClientDetail({ client: initial }: { client: Client }) {
  const router = useRouter();
  const [client, setClient] = useState(initial);
  const [logForm, setLogForm] = useState({
    title: "",
    body: "",
    category: "seo",
  });
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  const defaultPeriod = useMemo(() => {
    const start = startOfMonth(subMonths(new Date(), 1));
    const end = endOfMonth(subMonths(new Date(), 1));
    return {
      start: formatISO(start, { representation: "date" }),
      end: formatISO(end, { representation: "date" }),
    };
  }, []);

  async function refresh() {
    const res = await fetch(`/api/clients/${client.id}`);
    const data = await res.json();
    setClient(data);
    router.refresh();
  }

  async function connect(type: "ga4" | "gsc") {
    setBusy(`connect-${type}`);
    await fetch("/api/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: client.id, type, provider: "mock" }),
    });
    setBusy("");
    setMessage(`${type.toUpperCase()} connected with demo provider`);
    await refresh();
  }

  async function addWorkLog(e: React.FormEvent) {
    e.preventDefault();
    setBusy("log");
    await fetch("/api/work-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: client.id,
        periodStart: defaultPeriod.start,
        periodEnd: defaultPeriod.end,
        ...logForm,
      }),
    });
    setLogForm({ title: "", body: "", category: "seo" });
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
        periodStart: defaultPeriod.start,
        periodEnd: defaultPeriod.end,
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
    await fetch("/api/ai-mentions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: client.id }),
    });
    setBusy("");
    await refresh();
  }

  const ga4 = client.connections.find((c) => c.type === "ga4");
  const gsc = client.connections.find((c) => c.type === "gsc");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/app/clients" className="text-sm font-medium text-teal-800 hover:underline">
            ← Clients
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl font-semibold text-slate-950">{client.name}</h1>
            {client.aiMentionsEnabled ? <Badge tone="brand">AI mentions on</Badge> : null}
          </div>
          <p className="mt-1 font-mono text-sm text-slate-500">{client.domain}</p>
        </div>
        <Button onClick={generateNow} disabled={busy === "generate"} size="lg">
          {busy === "generate" ? "Generating…" : "Generate report"}
        </Button>
      </div>

      {message ? (
        <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
          {message}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <section className="panel p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Data connections</h2>
            <Badge tone="neutral">Demo-ready</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Google OAuth when env vars are set; otherwise mock metrics keep the flow live.
          </p>
          <div className="mt-5 space-y-3">
            {[
              { key: "ga4" as const, label: "Google Analytics 4", conn: ga4 },
              { key: "gsc" as const, label: "Search Console", conn: gsc },
            ].map((row) => (
              <div
                key={row.key}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{row.label}</p>
                  <p className="truncate text-xs text-slate-500">
                    {row.conn ? (
                      <>
                        <span className="status-dot mr-1.5 bg-emerald-500" />
                        {row.conn.displayName} · {row.conn.provider}
                      </>
                    ) : (
                      <>
                        <span className="status-dot mr-1.5 bg-slate-300" />
                        Not connected
                      </>
                    )}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => connect(row.key)}
                  disabled={!!busy}
                >
                  {row.conn ? "Reconnect" : "Connect"}
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="text-sm font-semibold text-slate-900">Monthly schedule</h2>
          <p className="mt-1 text-sm text-slate-500">
            Cron-ready stub. Generate for{" "}
            <span className="font-medium text-slate-700">
              {periodLabel(defaultPeriod.start, defaultPeriod.end)}
            </span>
            .
          </p>
          <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            Configure the generate day in Settings, then hook a monthly cron to the generate
            endpoint for each client.
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="panel p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Work log</h2>
              <p className="mt-0.5 text-sm text-slate-500">Proof bullets for this reporting period.</p>
            </div>
            <Badge tone="neutral">{client.workLogs.length} entries</Badge>
          </div>

          <form onSubmit={addWorkLog} className="mt-5 space-y-3 border-b border-slate-100 pb-5">
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
                required
              />
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[140px] flex-1 space-y-1.5">
                <Label>Category</Label>
                <select
                  className="h-10 w-full rounded-[8px] border border-slate-300 bg-white px-3 text-sm"
                  value={logForm.category}
                  onChange={(e) => setLogForm({ ...logForm, category: e.target.value })}
                >
                  {["seo", "content", "technical", "links", "other"].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <Button size="sm" disabled={busy === "log"}>
                Add entry
              </Button>
            </div>
          </form>

          <ul className="mt-4 space-y-3">
            {client.workLogs.map((w) => (
              <li key={w.id} className="rounded-lg border border-slate-200 px-3 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="brand">{w.category}</Badge>
                      <p className="text-sm font-semibold text-slate-900">{w.title}</p>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{w.body}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => deleteLog(w.id)}>
                    Delete
                  </Button>
                </div>
              </li>
            ))}
            {client.workLogs.length === 0 ? (
              <li className="py-6 text-center text-sm text-slate-500">No work logged yet.</li>
            ) : null}
          </ul>
        </section>

        <div className="space-y-6">
          <section className="panel p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">AI mentions</h2>
                <p className="mt-0.5 text-sm text-slate-500">Optional last PDF page.</p>
              </div>
              <Button size="sm" variant={client.aiMentionsEnabled ? "soft" : "outline"} onClick={toggleAiMentions}>
                {client.aiMentionsEnabled ? "Enabled" : "Enable"}
              </Button>
            </div>
            <Button
              className="mt-4"
              size="sm"
              variant="secondary"
              onClick={seedAiMentions}
              disabled={busy === "ai"}
            >
              Run mock AEO check
            </Button>
            <ul className="mt-4 space-y-2">
              {client.aiMentions.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm"
                >
                  <span className="font-medium capitalize text-slate-800">{a.engine}</span>
                  <Badge tone={a.mentioned ? "success" : "neutral"}>
                    {a.mentioned ? "Mentioned" : "Not mentioned"}
                  </Badge>
                </li>
              ))}
              {client.aiMentions.length === 0 ? (
                <li className="text-sm text-slate-500">No checks yet.</li>
              ) : null}
            </ul>
          </section>

          <section className="panel p-5">
            <h2 className="text-sm font-semibold text-slate-900">Report history</h2>
            <ul className="mt-3 divide-y divide-slate-100">
              {client.reportRuns.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/app/reports/${r.id}`}
                    className="flex items-center justify-between py-2.5 text-sm transition hover:text-teal-800"
                  >
                    <span>{periodLabel(r.periodStart, r.periodEnd)}</span>
                    <Badge
                      tone={
                        r.status === "ready" ? "success" : r.status === "generating" ? "warning" : "neutral"
                      }
                    >
                      {r.status}
                    </Badge>
                  </Link>
                </li>
              ))}
              {client.reportRuns.length === 0 ? (
                <li className="py-3 text-sm text-slate-500">No reports yet.</li>
              ) : null}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
