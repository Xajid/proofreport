import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Plus, Users, Zap } from "lucide-react";
import { ClientsTable } from "./clients-table";

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);
  const orgId = session!.user.orgId!;

  const [clients, org] = await Promise.all([
    prisma.client.findMany({
      where: { orgId },
      include: {
        connections: true,
        _count: { select: { workLogs: true, reportRuns: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.organization.findUnique({ where: { id: orgId }, select: { plan: true } }),
  ]);

  const clientCount = clients.length;

  const rows = clients.map((c) => ({
    id: c.id,
    name: c.name,
    domain: c.domain,
    aiMentionsEnabled: c.aiMentionsEnabled,
    connectionsCount: c.connections.length,
    workLogsCount: c._count.workLogs,
    reportRunsCount: c._count.reportRuns,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-indigo-700">
              <Users className="h-3 w-3" />
              Clients
            </span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
            Portfolio
          </h1>
          <p className="mt-1 text-sm text-slate-500">Domains you report on each month.</p>
        </div>
        <Link href="/app/clients/new">
          <Button size="sm" disabled={org?.plan === "trial" && clientCount >= 1}>
            <Plus className="h-4 w-4" />
            Add client
          </Button>
        </Link>
      </div>

      {org?.plan === "trial" && clientCount >= 1 && (
        <div className="rounded-[var(--radius)] border border-amber-200/80 bg-amber-50/80 px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Trial limit reached</p>
              <p className="text-sm text-amber-700 mt-0.5">Your trial allows 1 client. Upgrade to add your full roster.</p>
            </div>
          </div>
          <Link href="/pricing">
            <Button size="sm" className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white border-0">
              Upgrade now
            </Button>
          </Link>
        </div>
      )}

      <ClientsTable clients={rows} />
    </div>
  );
}
