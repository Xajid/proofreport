import Link from "next/link";
import { Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ArticleSection, DataTable, MarketingArticle, OnThisPage } from "@/components/marketing-article";
import { cn } from "@/lib/utils";
import { PUBLIC_PAGES } from "@/lib/site-content";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(PUBLIC_PAGES.sample);

const SECTIONS = [
  { id: "executive-summary", label: "Executive summary" },
  { id: "organic-performance", label: "Organic performance" },
  { id: "conversions", label: "Conversions" },
  { id: "work-log", label: "Work log" },
  { id: "next-actions", label: "Next actions" },
];

export default function SamplePage() {
  return (
    <MarketingArticle
      page={PUBLIC_PAGES.sample}
      lede="Demo client is Bright Plumbing Co., prepared by Northline SEO. Cover, a short write-up, GA4, Search Console, the work log, and three lines for next month. The figures on this page are a fixed example. The PDF is generated when you open it, so its numbers can differ. Both are watermarked."
    >
      <div className="flex flex-wrap gap-3">
        <a href="/api/sample" className={cn(buttonVariants({ size: "lg" }))} target="_blank" rel="noopener noreferrer">
          <Download className="h-4 w-4" aria-hidden="true" />
          Open sample PDF
        </a>
        <Link href="/register" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
          Start 14-day trial
        </Link>
      </div>

      <OnThisPage items={SECTIONS} />

      <ArticleSection id="executive-summary" title="Executive summary">
        <p>
          Paid PDFs use your agency name, logo, and color. This sample, and anything you export during the
          trial, keeps the SearchProof watermark.
        </p>
        <p>The write-up is three blocks. You can change them before the email goes out.</p>
        <div className="space-y-3 rounded-[12px] border border-slate-200/80 bg-white p-5">
          <p>
            <strong className="text-slate-950">What we shipped.</strong> Service pages rewritten, crawl errors
            cleared, citations aligned. Hours are on each work-log line.
          </p>
          <p>
            <strong className="text-slate-950">What moved.</strong> Organic sessions 3,842 (+14.2% versus the
            previous period). Search clicks 1,904 (+9.8%). Conversions 47.
          </p>
          <p>
            <strong className="text-slate-950">What we are not claiming.</strong> These figures sit next to the
            work logged for the period. The relationship is correlation. The report does not say the work
            produced the movement.
          </p>
        </div>
        <p>
          That last block is in every draft. Edit the wording if you want. The{" "}
          <Link href="/monthly-seo-report" className="font-semibold text-teal-800 underline">
            notes on the file
          </Link>{" "}
          say why we leave it in.
        </p>
      </ArticleSection>

      <ArticleSection id="organic-performance" title="Organic performance">
        <p>
          Connect Google, then pick the property. If the pull fails, generation stops and names the source.
          Demo numbers are never stored as a live property.
        </p>
        <DataTable caption="Example totals. Not a live export.">
          <thead>
            <tr>
              <th scope="col" className="border-b border-slate-200 px-4 py-2 font-semibold text-slate-900">
                Metric
              </th>
              <th scope="col" className="border-b border-slate-200 px-4 py-2 text-right font-semibold text-slate-900">
                This period
              </th>
              <th scope="col" className="border-b border-slate-200 px-4 py-2 text-right font-semibold text-slate-900">
                Versus prior period
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Organic sessions", "3,842", "+14.2%"],
              ["Search clicks", "1,904", "+9.8%"],
              ["Impressions", "28,410", "+6.1%"],
              ["Average position", "11.4", "−0.8"],
              ["Conversions", "47", "+12.4%"],
            ].map(([metric, value, delta]) => (
              <tr key={metric}>
                <th scope="row" className="border-b border-slate-100 px-4 py-2 font-medium text-slate-900">
                  {metric}
                </th>
                <td className="border-b border-slate-100 px-4 py-2 text-right">{value}</td>
                <td className="border-b border-slate-100 px-4 py-2 text-right">{delta}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
        <DataTable caption="Queries under the totals, same example.">
          <thead>
            <tr>
              <th scope="col" className="border-b border-slate-200 px-4 py-2 font-semibold text-slate-900">
                Query
              </th>
              <th scope="col" className="border-b border-slate-200 px-4 py-2 text-right font-semibold text-slate-900">
                Clicks
              </th>
              <th scope="col" className="border-b border-slate-200 px-4 py-2 text-right font-semibold text-slate-900">
                Impressions
              </th>
              <th scope="col" className="border-b border-slate-200 px-4 py-2 text-right font-semibold text-slate-900">
                Avg. position
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              ["emergency plumber", "240", "3,100", "6.2"],
              ["water heater repair", "180", "2,400", "8.1"],
              ["drain cleaning near me", "96", "1,800", "9.4"],
            ].map(([query, clicks, impressions, position]) => (
              <tr key={query}>
                <th scope="row" className="border-b border-slate-100 px-4 py-2 font-medium text-slate-900">
                  {query}
                </th>
                <td className="border-b border-slate-100 px-4 py-2 text-right">{clicks}</td>
                <td className="border-b border-slate-100 px-4 py-2 text-right">{impressions}</td>
                <td className="border-b border-slate-100 px-4 py-2 text-right">{position}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
        <p>Landing pages are under the queries, with organic sessions for each path.</p>
      </ArticleSection>

      <ArticleSection id="conversions" title="Conversions">
        <p>
          Organic conversions for the month, split by goal when GA4 returns more than one. If the property
          comes back empty, the page says no events were returned.
        </p>
      </ArticleSection>

      <ArticleSection id="work-log" title="Work log">
        <p>Title, category, hours, and what changed. This is the demo log.</p>
        <ul className="space-y-3">
          <li className="rounded-[12px] border border-slate-200/80 bg-white p-4">
            <p className="font-semibold text-slate-950">Refreshed service landing pages · content · 6h</p>
            <p className="mt-1">
              Rewrote H1s, added FAQs, and strengthened internal links on Drain Cleaning, Water Heaters, and
              Emergency pages.
            </p>
          </li>
          <li className="rounded-[12px] border border-slate-200/80 bg-white p-4">
            <p className="font-semibold text-slate-950">Fixed crawl / soft-404 issues · technical · 3.5h</p>
            <p className="mt-1">Resolved 12 soft-404 URLs, updated redirects, and resubmitted the sitemap in Search Console.</p>
          </li>
          <li className="rounded-[12px] border border-slate-200/80 bg-white p-4">
            <p className="font-semibold text-slate-950">Local citation cleanup · seo · 2h</p>
            <p className="mt-1">Aligned NAP on the top 8 directories and responded to new Google reviews.</p>
          </li>
        </ul>
        <p>
          Paid files put your name on that page. Setup for one retainer is on{" "}
          <Link href="/white-label-seo-reports" className="font-semibold text-teal-800 underline">
            white-label reports
          </Link>
          .
        </p>
      </ArticleSection>

      <ArticleSection id="next-actions" title="Next actions">
        <p>Three lines. You edit them. Nothing is emailed until you mark the draft ready.</p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Refresh the page that ranks for the query sitting outside the top 10.</li>
          <li>Keep the conversion path on the top landing page, and log any change you make to it.</li>
          <li>Finish the technical items still open, then recheck the same templates next month.</li>
        </ol>
        <p>
          You can add an{" "}
          <Link href="/ai-search-mentions" className="font-semibold text-teal-800 underline">
            AI mentions
          </Link>{" "}
          page. The sample PDF leaves it off.
        </p>
      </ArticleSection>
    </MarketingArticle>
  );
}
