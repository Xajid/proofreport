"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  Users,
  FileCheck2,
  DollarSign,
  Search,
  CheckCircle2,
} from "lucide-react";

export type AdminOrg = {
  id: string;
  name: string;
  plan: string;
  primaryColor: string;
  stripeCustomerId: string | null;
  scheduleDay: number;
  createdAt: string;
  updatedAt: string;
  owner: { id: string; name: string | null; email: string } | null;
  clientCount: number;
  reportCount: number;
};

export type AdminSummary = {
  totalAgencies: number;
  paidAgencies: number;
  trialAgencies: number;
  totalClients: number;
  totalReports: number;
  estimatedMrr: number;
};

export function AdminDashboard({
  initialOrgs,
  initialSummary,
}: {
  initialOrgs: AdminOrg[];
  initialSummary: AdminSummary;
}) {
  const [orgs, setOrgs] = useState<AdminOrg[]>(initialOrgs);
  const [query, setQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filteredOrgs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orgs.filter((org) => {
      if (planFilter !== "all" && org.plan !== planFilter) return false;
      if (q) {
        const matchesName = org.name.toLowerCase().includes(q);
        const matchesEmail = org.owner?.email.toLowerCase().includes(q) ?? false;
        const matchesOwner = org.owner?.name?.toLowerCase().includes(q) ?? false;
        if (!matchesName && !matchesEmail && !matchesOwner) return false;
      }
      return true;
    });
  }, [orgs, query, planFilter]);

  async function updatePlan(orgId: string, newPlan: "trial" | "per_client" | "agency") {
    setUpdatingId(orgId);
    try {
      const res = await fetch(`/api/admin/orgs/${orgId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: newPlan }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to update plan");
        return;
      }
      setOrgs((prev) =>
        prev.map((o) => (o.id === orgId ? { ...o, plan: newPlan } : o))
      );
      setToast(`Updated ${orgs.find((o) => o.id === orgId)?.name} to ${newPlan}`);
      setTimeout(() => setToast(null), 3000);
    } catch {
      alert("Network error updating plan");
    } finally {
      setUpdatingId(null);
    }
  }

  const stats = [
    {
      label: "Total Agencies",
      value: String(initialSummary.totalAgencies),
      sub: `${initialSummary.paidAgencies} paying customers`,
      icon: Building2,
      color: "text-amber-400",
      bg: "bg-amber-400/10 border-amber-400/20",
    },
    {
      label: "Estimated MRR",
      value: `$${initialSummary.estimatedMrr.toLocaleString()}`,
      sub: "Active subscriptions",
      icon: DollarSign,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10 border-emerald-400/20",
    },
    {
      label: "Total End-Clients",
      value: String(initialSummary.totalClients),
      sub: "Across all workspaces",
      icon: Users,
      color: "text-sky-400",
      bg: "bg-sky-400/10 border-sky-400/20",
    },
    {
      label: "Reports Generated",
      value: String(initialSummary.totalReports),
      sub: "Platform total",
      icon: FileCheck2,
      color: "text-teal-400",
      bg: "bg-teal-400/10 border-teal-400/20",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-[10px] bg-emerald-500 text-slate-950 font-semibold px-4 py-2.5 text-xs shadow-lg flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
          Platform Overview
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage your paying agencies, subscription tiers, and platform growth.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-[14px] border border-white/10 bg-[#0e1422] p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {s.label}
              </span>
              <span className={`rounded-[8px] border p-1.5 ${s.bg}`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </span>
            </div>
            <p className="font-display mt-3 text-3xl font-bold text-white">{s.value}</p>
            <p className="mt-1 text-xs text-slate-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Agency Directory Section */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white">Agency Directory</h2>
            <p className="text-xs text-slate-400">
              Showing {filteredOrgs.length} of {orgs.length} agencies
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search agency or owner…"
                className="h-8 w-full rounded-[8px] border border-white/10 bg-white/5 pl-8 pr-3 text-xs text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            {/* Plan filter */}
            <div className="flex items-center rounded-[8px] border border-white/10 bg-white/5 p-0.5 text-xs">
              {[
                ["all", "All"],
                ["trial", "Trial"],
                ["per_client", "Per Client"],
                ["agency", "Agency"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPlanFilter(id)}
                  className={`rounded-[6px] px-2.5 py-1 text-xs font-medium transition-colors ${
                    planFilter === id
                      ? "bg-amber-500/20 text-amber-300 font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-[14px] border border-white/10 bg-[#0e1422] overflow-hidden shadow-sm">
          <div className="hidden grid-cols-[1.5fr_1.4fr_1.1fr_0.6fr_0.6fr_1fr] gap-3 border-b border-white/10 bg-white/[0.02] px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 sm:grid">
            <span>Agency</span>
            <span>Owner</span>
            <span>Subscription Plan</span>
            <span>Clients</span>
            <span>Reports</span>
            <span>Created</span>
          </div>

          {filteredOrgs.length === 0 ? (
            <div className="py-14 text-center text-sm text-slate-500">
              No matching agencies found.
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {filteredOrgs.map((org) => (
                <li
                  key={org.id}
                  className="grid gap-3 px-5 py-3.5 transition-colors hover:bg-white/[0.02] sm:grid-cols-[1.5fr_1.4fr_1.1fr_0.6fr_0.6fr_1fr] sm:items-center text-xs"
                >
                  {/* Agency name + color */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="h-3 w-3 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: org.primaryColor || "#0d6e68" }}
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate text-[13px]">
                        {org.name}
                      </p>
                      {org.stripeCustomerId ? (
                        <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Stripe customer
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">No Stripe ID</span>
                      )}
                    </div>
                  </div>

                  {/* Owner */}
                  <div className="min-w-0">
                    <p className="font-medium text-slate-200 truncate">
                      {org.owner?.email || "No owner"}
                    </p>
                    {org.owner?.name && (
                      <p className="text-[11px] text-slate-400 truncate">{org.owner.name}</p>
                    )}
                  </div>

                  {/* Plan with live selector */}
                  <div>
                    <select
                      value={org.plan}
                      disabled={updatingId === org.id}
                      onChange={(e) =>
                        updatePlan(
                          org.id,
                          e.target.value as "trial" | "per_client" | "agency"
                        )
                      }
                      className={`h-7 rounded-[6px] border px-2 text-[11px] font-semibold transition-all focus:outline-none ${
                        org.plan === "agency"
                          ? "bg-indigo-950/80 text-indigo-300 border-indigo-700/50"
                          : org.plan === "per_client"
                          ? "bg-teal-950/80 text-teal-300 border-teal-700/50"
                          : "bg-amber-950/80 text-amber-300 border-amber-700/50"
                      }`}
                    >
                      <option value="trial" className="bg-slate-900 text-slate-200">
                        Trial (1 client)
                      </option>
                      <option value="per_client" className="bg-slate-900 text-slate-200">
                        Per Client ($49/mo)
                      </option>
                      <option value="agency" className="bg-slate-900 text-slate-200">
                        Agency ($199/mo)
                      </option>
                    </select>
                  </div>

                  {/* Client Count */}
                  <div className="font-mono font-medium text-slate-300">
                    {org.clientCount}
                  </div>

                  {/* Report Count */}
                  <div className="font-mono font-medium text-slate-300">
                    {org.reportCount}
                  </div>

                  {/* Created At */}
                  <div className="text-slate-400 text-[11px]">
                    {new Date(org.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
