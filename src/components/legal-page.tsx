import type { ReactNode } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { BrandLogo } from "@/components/brand-logo";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen surface-mesh">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">SearchProof</p>
        <h1 className="font-display mt-3 text-4xl font-semibold text-slate-950">{title}</h1>
        <p className="mt-3 text-sm text-slate-500">Last updated 20 November 2026</p>
        <article className="mt-10 space-y-8 text-[15px] leading-7 text-slate-700">{children}</article>
      </main>
      <footer className="border-t border-slate-200/80 bg-white/70">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <BrandLogo href="/" size="sm" />
          <nav aria-label="Legal" className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-900">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-900">
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8">
      <h2 className="font-display text-xl font-semibold text-slate-950">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
