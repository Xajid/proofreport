"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  FileText,
  ChevronRight,
  Sparkles,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { BrandLogo } from "./brand-logo";

const links = [
  { href: "/app", label: "Overview", exact: true, icon: LayoutDashboard },
  { href: "/app/clients", label: "Clients", icon: Users },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function AppShell({
  children,
  orgName,
  plan,
  clientCount,
  isAdmin,
}: {
  children: React.ReactNode;
  orgName?: string;
  plan?: string;
  clientCount?: number;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen surface-app lg:grid lg:grid-cols-[240px_1fr]">
      {/* ── Sidebar ── */}
      <aside className="border-b border-slate-800/60 bg-[#0d1117] text-slate-300 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:border-slate-800/70 lg:flex lg:flex-col">
        {/* Logo area */}
        <div className="flex items-center border-b border-slate-800/60 px-5 py-4">
          <BrandLogo href="/app" tone="light" size="sm" />
        </div>

        {/* Org badge */}
        <div className="hidden px-5 py-3 lg:block">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1">
            Workspace
          </p>
          <p className="truncate text-sm font-medium text-slate-200">{orgName || "Agency workspace"}</p>
        </div>

        {/* Nav */}
        <nav className="flex gap-1 overflow-x-auto px-3 py-2 lg:flex-col lg:overflow-visible lg:px-3 lg:py-2">
          {links.map((l) => {
            const active = l.exact
              ? pathname === l.href
              : pathname === l.href || pathname.startsWith(`${l.href}/`);
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "group flex items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-[13px] font-medium transition-all duration-150 whitespace-nowrap",
                  active
                    ? "nav-active"
                    : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    active ? "text-teal-400" : "text-slate-500 group-hover:text-slate-300"
                  )}
                />
                <span className="flex-1">{l.label}</span>
                {active && (
                  <ChevronRight className="h-3.5 w-3.5 text-teal-500/60" />
                )}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                "group flex items-center gap-2.5 rounded-[8px] px-3 py-2 text-[13px] font-medium transition-all duration-150 whitespace-nowrap mt-2 border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
              )}
            >
              <ShieldCheck className="h-4 w-4 shrink-0 text-amber-400" />
              <span className="flex-1">Super-Admin</span>
              <span className="rounded bg-amber-400/20 px-1.5 py-0.2 text-[10px] font-semibold text-amber-200">
                HQ
              </span>
            </Link>
          )}
        </nav>

        {/* This-month tip card */}
        <div className="mx-3 mt-4 hidden rounded-[10px] border border-teal-900/50 bg-gradient-to-br from-teal-950/80 to-slate-900/60 p-3.5 lg:block">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
            <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-400">
              This month
            </p>
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-slate-400">
            Generate, review narrative, and send branded PDFs before month-end.
          </p>
        </div>

        {plan === "trial" && (
          <div className="mx-3 mt-3 hidden rounded-[10px] border border-amber-800/40 bg-gradient-to-br from-amber-950/60 to-slate-900/60 p-3.5 lg:block">
            <div className="flex items-center gap-2 mb-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-400">
                Trial plan
              </p>
            </div>
            <p className="text-[12px] leading-relaxed text-slate-400 mb-3">
              {clientCount !== undefined && clientCount >= 1
                ? "Client limit reached. Upgrade to add more."
                : `${1 - (clientCount ?? 0)} client slot remaining.`}
            </p>
            <a
              href="/pricing"
              className="block w-full rounded-[7px] bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 text-center text-[12px] font-semibold text-amber-300 hover:bg-amber-500/30 transition-colors"
            >
              Upgrade plan →
            </a>
          </div>
        )}

        {/* Footer / Sign out */}
        <div className="mt-auto hidden border-t border-slate-800/60 px-3 py-4 lg:block">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-[13px] text-slate-500 hover:bg-white/[0.05] hover:text-slate-300"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="min-w-0 flex flex-col">
        {/* Mobile topbar */}
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-sm shadow-[var(--shadow-xs)] lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-teal-700">
              <FileText className="h-3.5 w-3.5 text-white" />
            </div>
            <p className="text-sm font-semibold text-slate-900">{orgName}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
            Sign out
          </Button>
        </div>

        {/* Page content */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
