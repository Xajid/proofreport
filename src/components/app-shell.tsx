"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Users, Settings, LogOut, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const links = [
  { href: "/app", label: "Overview", exact: true, icon: LayoutDashboard },
  { href: "/app/clients", label: "Clients", icon: Users },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function AppShell({
  children,
  orgName,
}: {
  children: React.ReactNode;
  orgName?: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen surface-app lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-slate-200/90 bg-[#0b1220] text-slate-200 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:border-slate-800">
        <div className="flex h-full flex-col px-4 py-5">
          <div className="px-2">
            <Link href="/app" className="font-display text-lg font-semibold text-white">
              ProofReport
            </Link>
            <p className="mt-1 truncate text-xs font-medium text-slate-400">
              {orgName || "Agency workspace"}
            </p>
          </div>

          <nav className="mt-8 flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
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
                    "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition whitespace-nowrap",
                    active
                      ? "bg-teal-500/15 text-teal-200"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-90" />
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 hidden rounded-lg border border-slate-800 bg-slate-900/60 p-3 lg:block">
            <div className="flex items-center gap-2 text-teal-200">
              <FileText className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-wide">This month</p>
            </div>
            <p className="mt-2 text-sm leading-snug text-slate-300">
              Generate, review narrative, and send branded PDFs before month-end.
            </p>
          </div>

          <div className="mt-auto hidden border-t border-slate-800 pt-4 lg:block">
            <div className="rounded-lg bg-slate-900/70 px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Workspace
              </p>
              <p className="mt-1 truncate text-sm font-medium text-slate-100">{orgName}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 w-full justify-start text-slate-400 hover:bg-white/5 hover:text-white"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <p className="text-sm font-medium text-slate-700">{orgName}</p>
          <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
            Sign out
          </Button>
        </div>
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
