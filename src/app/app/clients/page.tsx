import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);
  const clients = await prisma.client.findMany({
    where: { orgId: session!.user.orgId! },
    include: {
      connections: true,
      _count: { select: { workLogs: true, reportRuns: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">Clients</p>
          <h1 className="font-display mt-1 text-3xl font-semibold text-slate-950">Portfolio</h1>
          <p className="mt-1 text-sm text-slate-600">Domains you report on each month.</p>
        </div>
        <Link href="/app/clients/new">
          <Button>Add client</Button>
        </Link>
      </div>

      <div className="panel overflow-hidden">
        <div className="hidden grid-cols-[1.4fr_1fr_0.7fr_0.7fr_0.7fr] gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:grid">
          <span>Client</span>
          <span>Domain</span>
          <span>Connections</span>
          <span>Work logs</span>
          <span>Reports</span>
        </div>
        {clients.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-medium text-slate-900">No clients yet</p>
            <p className="mt-1 text-sm text-slate-600">
              Add a domain to start logging work and generating reports.
            </p>
            <Link href="/app/clients/new" className="mt-4 inline-block">
              <Button>Add your first client</Button>
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {clients.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/app/clients/${c.id}`}
                  className="grid gap-1 px-4 py-3.5 transition hover:bg-slate-50 sm:grid-cols-[1.4fr_1fr_0.7fr_0.7fr_0.7fr] sm:items-center sm:gap-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{c.name}</span>
                    {c.aiMentionsEnabled ? <Badge tone="brand">AI mentions</Badge> : null}
                  </div>
                  <span className="font-mono text-sm text-slate-600">{c.domain}</span>
                  <span className="text-sm text-slate-600">{c.connections.length}</span>
                  <span className="text-sm text-slate-600">{c._count.workLogs}</span>
                  <span className="text-sm text-slate-600">{c._count.reportRuns}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
