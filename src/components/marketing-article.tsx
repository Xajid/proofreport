import type { ReactNode } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { JsonLd } from "@/components/json-ld";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { GUIDE_LINKS, type PublicPage } from "@/lib/site-content";

export function MarketingArticle({
  page,
  lede,
  children,
}: {
  page: PublicPage;
  lede: string;
  children: ReactNode;
}) {
  const related = GUIDE_LINKS.filter((item) => item.path !== page.path);

  return (
    <div className="min-h-screen surface-mesh">
      <JsonLd data={articleJsonLd(page)} />
      <JsonLd data={breadcrumbJsonLd(page)} />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-8">
        <nav className="breadcrumb" aria-label="Breadcrumbs">
          <ol>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href={page.path} aria-current="page">
                {page.crumb}
              </Link>
            </li>
          </ol>
        </nav>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">{page.crumb}</p>
        <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          {page.heading ?? page.title}
        </h1>
        <p className="mt-5 text-[16px] leading-relaxed text-slate-600">{lede}</p>
        <article className="mt-12 space-y-10 text-[15px] leading-7 text-slate-700">{children}</article>
        <aside aria-labelledby="related-heading" className="mt-16 border-t border-slate-200/80 pt-10">
          <h2 id="related-heading" className="font-display text-2xl font-semibold text-slate-950">
            Other pages
          </h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {related.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className="block h-full rounded-[12px] border border-slate-200/80 bg-white p-4 hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                >
                  <span className="font-semibold text-slate-900 underline decoration-teal-700/30 underline-offset-4">
                    {item.crumb}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-slate-600">{item.blurb}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </main>
      <SiteFooter />
    </div>
  );
}

export function OnThisPage({ items }: { items: { id: string; label: string }[] }) {
  return (
    <nav aria-label="On this page" className="rounded-[12px] border border-slate-200/80 bg-white px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">On this page</p>
      <ol className="mt-2 list-decimal space-y-1 pl-5">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="font-medium text-teal-800 underline decoration-teal-700/30 underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function DataTable({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-[12px] border border-slate-200/80 bg-white">
      <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
        <caption className="border-b border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-600">
          {caption}
        </caption>
        {children}
      </table>
    </div>
  );
}

export function ArticleSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8" aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`} className="font-display text-2xl font-semibold text-slate-950">
        {title}
      </h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
