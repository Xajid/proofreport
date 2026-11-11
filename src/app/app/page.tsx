import Link from "next/link";
import { getServerSession } from "next-auth";
import { Users, FileCheck2, Activity, ArrowUpRight, Plus } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { periodLabel } from "@/lib/utils";

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

  const stats = [
    {
      label: "Active clients",
      value: String(clientCount),
      hint: "In this workspace",
      icon: Users,
    },
    {
      label: "Recent runs",
      value: String(reports.length),
      hint: "Latest activity",
      icon: Activity,
    },
    {
      label: "Ready to send",
      value: String(readyCount),
      hint: "Marked ready",
      icon: FileCheck2,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">Overview</p>
          <h1 className="font-display mt-1 text-3xl font-semibold text-slate-950">{org?.name}</h1>
          <p className="mt-1 text-sm text-slate-600">
            Monthly reporting workspace · scheduled day {org?.scheduleDay ?? 1}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/settings">
            <Button variant="outline">Branding</Button>
          </Link>
          <Link href="/app/clients">
            <Button>Manage clients</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="!p-5">
            <div className="flex items-start justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{s.label}</p>
              <span className="rounded-md bg-teal-50 p-1.5 text-teal-800">
                <s.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-semibold text-slate-950">{s.value}</p>
            <p className="mt-1 text-sm text-slate-500">{s.hint}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Latest report runs</h2>
            <Link href="/app/clients" className="inline-flex items-center gap-1 text-sm font-medium text-teal-800 hover:underline">
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="panel overflow-hidden">
            {reports.length === 0 ? (
              <div className="p-6 text-sm text-slate-600">
                No reports yet. Open a client and click <strong>Generate report</strong>.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {reports.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/app/reports/${r.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-3.5 transition hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">{r.client.name}</p>
                        <p className="text-sm text-slate-500">
                          {periodLabel(r.periodStart, r.periodEnd)}
                        </p>
                      </div>
                      <Badge
                        tone={
                          r.status === "ready"
                            ? "success"
                            : r.status === "generating"
                              ? "warning"
                              : "neutral"
                        }
                      >
                        {r.status}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Clients</h2>
            <Link href="/app/clients/new" className="inline-flex items-center gap-1 text-sm font-medium text-teal-800 hover:underline">
              <Plus className="h-3.5 w-3.5" /> Add
            </Link>
          </div>
          <div className="panel divide-y divide-slate-100 overflow-hidden">
            {clients.map((c) => (
              <Link
                key={c.id}
                href={`/app/clients/${c.id}`}
                className="block px-4 py-3.5 transition hover:bg-slate-50"
              >
                <p className="font-medium text-slate-900">{c.name}</p>
                <p className="font-mono text-sm text-slate-500">{c.domain}</p>
              </Link>
            ))}
            {clients.length === 0 ? (
              <div className="p-6 text-sm text-slate-600">Add your first client to begin.</div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
