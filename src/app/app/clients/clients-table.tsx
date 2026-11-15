"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Globe, Layers, ArrowUpRight, Search, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PortfolioClient = {
  id: string;
  name: string;
  domain: string;
  aiMentionsEnabled: boolean;
  connectionsCount: number;
  workLogsCount: number;
  reportRunsCount: number;
};

type FilterMode = "all" | "connected" | "ai";

export function ClientsTable({ clients }: { clients: PortfolioClient[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients.filter((c) => {
      if (filter === "connected" && c.connectionsCount === 0) return false;
      if (filter === "ai" && !c.aiMentionsEnabled) return false;
      if (q && !c.name.toLowerCase().includes(q) && !c.domain.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [clients, query, filter]);

  if (clients.length === 0) {
    return (
      <div className="rounded-[var(--radius)] border border-slate-200/80 bg-white shadow-[var(--shadow-sm)]">
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="rounded-full bg-slate-100 p-4">
            <Users className="h-6 w-6 text-slate-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">No clients yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Add a domain to start logging work and generating reports.
            </p>
          </div>
          <Link href="/app/clients/new" className="mt-2">
            <Button>
              <Plus className="h-4 w-4" />
              Add your first client
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search & filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients or domains…"
            className="h-9 w-full rounded-[8px] border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-[var(--shadow-xs)] placeholder:text-slate-400 focus:border-[var(--brand)] focus:outline-none focus:ring-3 focus:ring-[var(--brand-mist)]"
          />
        </div>

        <div className="flex items-center gap-1.5 rounded-[9px] border border-slate-200 bg-white p-1 shadow-[var(--shadow-xs)]">
          {(
            [
              ["all", `All (${clients.length})`],
              ["connected", "Connected"],
              ["ai", "AI Mentions"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`rounded-[6px] px-2.5 py-1 text-xs font-semibold transition-colors ${
                filter === id
                  ? "bg-teal-50 text-teal-800 border border-teal-200/60"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[var(--radius)] border border-slate-200/80 bg-white shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="hidden grid-cols-[1.5fr_1fr_0.5fr_0.5fr_0.5fr_2.5rem] gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-2.5 sm:grid">
          {["Client", "Domain", "Connections", "Work logs", "Reports", ""].map((h) => (
            <span key={h} className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              {h}
            </span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">
            No matching clients.{" "}
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setFilter("all");
              }}
              className="font-semibold text-teal-700 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((c) => (
              <li key={c.id} className="table-row-alt">
                <Link
                  href={`/app/clients/${c.id}`}
                  className="group grid gap-2 px-5 py-3.5 transition-colors hover:bg-slate-50/80 sm:grid-cols-[1.5fr_1fr_0.5fr_0.5fr_0.5fr_2.5rem] sm:items-center sm:gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="hidden sm:flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-gradient-to-br from-teal-100 to-teal-50 border border-teal-100 text-teal-700 font-bold text-xs">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-900 text-sm">{c.name}</span>
                      {c.aiMentionsEnabled && (
                        <span className="ml-2 inline-flex items-center rounded-md bg-teal-50 border border-teal-100 px-1.5 py-0.5 text-[10px] font-semibold text-teal-700">
                          AI
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Globe className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="font-mono text-xs text-slate-600 truncate">{c.domain}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-700">{c.connectionsCount}</span>
                  </div>
                  <span className="text-sm text-slate-700">{c.workLogsCount}</span>
                  <span className="text-sm text-slate-700">{c.reportRunsCount}</span>
                  <div className="hidden sm:flex justify-end">
                    <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-teal-600 transition-colors" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

