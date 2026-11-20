import Link from "next/link";
import { getServerSession } from "next-auth";
import {
  Users,
  FileCheck2,
  Activity,
  ArrowUpRight,
  Plus,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { periodLabel } from "@/lib/utils";
import { clientSlotsUsed, getLimits } from "@/lib/plan";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const orgId = session!.user.orgId!;

  const [clientCount, reports, org, clients] = await Promise.all([
    prisma.client.count({ where: { orgId } }),
    prisma.reportRun.findMany({
      where: { client: { orgId } },
      include: { client: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.organization.findUnique({ where: { id: orgId } }),
    prisma.client.findMany({
      where: { orgId },
      orderBy: { updatedAt: "desc" },
      take: 4,
    }),
  ]);

  const readyCount = reports.filter((r) => r.status === "ready" || r.status === "sent").length;
  const addClientHref =
    clientSlotsUsed(org?.plan, clientCount, org?.clientsCreated ?? 0) >= getLimits(org?.plan, org).maxClients
      ? "/pricing?upgrade=clients"
      : "/app/clients/new";

  const stats = [
    {
      label: "Active clients",
      value: String(clientCount),
      hint: "In this workspace",
      icon: Users,
      color: "text-teal-700",
      bg: "bg-teal-50 border-teal-100",
      trend: null,
    },
    {
      label: "Recent runs",
      value: String(reports.length),
      hint: "Latest activity",
      icon: Activity,
      color: "text-indigo-700",
      bg: "bg-indigo-50 border-indigo-100",
      trend: null,
    },
    {
      label: "Ready to send",
      value: String(readyCount),
      hint: "Marked ready",
      icon: FileCheck2,
      color: "text-emerald-700",
      bg: "bg-emerald-50 border-emerald-100",
      trend: readyCount > 0 ? "positive" : null,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Page header ── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-teal-50 border border-teal-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-teal-800">
              <Zap className="h-3 w-3" />
              Overview
            </span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
            {org?.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monthly reporting workspace · sends on day {org?.scheduleDay ?? 1}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/settings">
            <Button variant="outline" size="sm">Branding</Button>
          </Link>
          <Link href="/app/clients">
            <Button size="sm">Manage clients</Button>
          </Link>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="panel-hover rounded-[var(--radius)] border border-slate-200/80 bg-white p-5 shadow-[var(--shadow-sm)]"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                {s.label}
              </p>
              <span className={`inline-flex rounded-[8px] border p-1.5 ${s.bg}`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-slate-900">{s.value}</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              {s.trend === "positive" && (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              )}
              <p className="text-[13px] text-slate-500">{s.hint}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent reports + clients ── */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        {/* Latest report runs */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold uppercase tracking-widest text-slate-500">
              Latest report runs
            </h2>
            <Link
              href="/app/clients"
              className="inline-flex items-center gap-1 text-[13px] font-medium text-teal-700 hover:text-teal-900 hover:underline underline-offset-2"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="rounded-[var(--radius)] border border-slate-200/80 bg-white shadow-[var(--shadow-sm)] overflow-hidden">
            {reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
                <div className="rounded-full bg-slate-100 p-3">
                  <Activity className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-700">No reports yet</p>
                <p className="text-sm text-slate-500">
                  Open a client and click <strong>Generate report</strong>.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {reports.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/app/reports/${r.id}`}
                      className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50/80 group"
                    >
                      <div className="min-w-0 flex items-center gap-3">
                        <div className="hidden sm:flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-slate-100 text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-700 transition-colors">
                          <FileCheck2 className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{r.client.name}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {periodLabel(r.periodStart, r.periodEnd)}
                          </p>
                        </div>
                      </div>
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
                        <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-teal-600 transition-colors" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Client quick-list */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold uppercase tracking-widest text-slate-500">
              Clients
            </h2>
            <Link
              href={addClientHref}
              className="inline-flex items-center gap-1 text-[13px] font-medium text-teal-700 hover:text-teal-900 hover:underline underline-offset-2"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </Link>
          </div>
          <div className="rounded-[var(--radius)] border border-slate-200/80 bg-white shadow-[var(--shadow-sm)] overflow-hidden">
            {clients.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <div className="rounded-full bg-slate-100 p-3">
                  <Users className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-700">No clients</p>
                <Link href="/app/clients/new">
                  <Button size="sm" className="mt-1">Add first client</Button>
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {clients.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/app/clients/${c.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/80 group"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{c.name}</p>
                        <p className="font-mono text-xs text-slate-500 truncate">{c.domain}</p>
                      </div>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-teal-600 transition-colors" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
