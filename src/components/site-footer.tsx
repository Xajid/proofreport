import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { GUIDE_LINKS, PUBLIC_PAGES } from "@/lib/site-content";

const FOOTER_LINKS = [...GUIDE_LINKS, PUBLIC_PAGES.pricing];

export function GuideIndex() {
  return (
    <section aria-labelledby="guides-heading" className="mx-auto max-w-6xl px-6 py-24">
      <h2 id="guides-heading" className="font-display text-3xl font-semibold text-slate-950 sm:text-4xl">
        Sample and notes
      </h2>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-600">
        The PDF written out, plus who it&apos;s for and how a month gets assembled.
      </p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GUIDE_LINKS.map((link) => (
          <li key={link.path}>
            <Link
              href={link.path}
              className="block h-full rounded-[14px] border border-slate-200/80 bg-white p-6 shadow-[var(--shadow-xs)] hover:border-slate-300 hover:shadow-[var(--shadow-sm)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              <h3 className="font-display text-lg font-semibold text-slate-900 underline decoration-teal-700/30 underline-offset-4">
                {link.crumb}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{link.blurb}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <nav aria-label="Guides" className="flex flex-wrap gap-x-5 gap-y-2">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className="text-sm font-medium text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              {link.crumb}
            </Link>
          ))}
        </nav>
        <div className="mt-8 flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <BrandLogo href="/" size="sm" />
          <p className="text-xs">Monthly client reports for SEO retainers.</p>
          <nav aria-label="Legal" className="flex gap-4 text-xs">
            <Link
              href="/privacy"
              className="font-medium text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-slate-950"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="font-medium text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-slate-950"
            >
              Terms
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
