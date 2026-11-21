import Link from "next/link";
import { ArticleSection, MarketingArticle, OnThisPage } from "@/components/marketing-article";
import { PUBLIC_PAGES } from "@/lib/site-content";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(PUBLIC_PAGES.guide);

export default function MonthlyReportGuidePage() {
  return (
    <MarketingArticle
      page={PUBLIC_PAGES.guide}
      lede="Most clients skim. The ones who read are looking for what you did, whether the numbers moved, and what you're doing next month. That's the file."
    >
      <OnThisPage
        items={[
          { id: "cover", label: "Cover" },
          { id: "shipped", label: "The work log" },
          { id: "moved", label: "The numbers" },
          { id: "correlation", label: "Correlation" },
          { id: "actions", label: "Next month" },
          { id: "leave-out", label: "What we skip" },
        ]}
      />

      <ArticleSection id="cover" title="Cover">
        <p>
          Client name, your name, and the month. &quot;Q3 performance&quot; makes them ask which weeks. We use
          the previous calendar month, same length as the one before it.
        </p>
        <p>
          If they&apos;re paying you, your name goes on the cover. The{" "}
          <Link href="/sample" className="font-semibold text-teal-800 underline">
            sample
          </Link>{" "}
          is watermarked. Paid PDFs use your logo and color.
        </p>
      </ArticleSection>

      <ArticleSection id="shipped" title="The work log">
        <p>
          Log it while you do it. Title, category (content, technical, local), hours if you track them, and
          one line on what changed. &quot;Ongoing SEO&quot; doesn&apos;t tell them anything. &quot;Resolved 12
          soft-404s and resubmitted the sitemap&quot; does.
        </p>
        <p>If it isn&apos;t in the log, don&apos;t add it when you write the summary.</p>
      </ArticleSection>

      <ArticleSection id="moved" title="The numbers">
        <p>Enough for most retainers:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Organic sessions from GA4</li>
          <li>Clicks, impressions, and average position from Search Console</li>
          <li>Conversions, by goal if the property has more than one</li>
          <li>The queries and landing pages that got the clicks</li>
        </ul>
        <p>
          Name the source. If a property isn&apos;t connected, say so. Don&apos;t paste a figure off a slide
          from March.
        </p>
      </ArticleSection>

      <ArticleSection id="correlation" title="Correlation">
        <p>
          The work and the traffic can move in the same month for a lot of reasons. A Google update. The
          season. A page you rewrote. The draft says the figures sit next to the work, and the relationship
          is correlation.
        </p>
        <p>
          You can still name the page and the query. If you know the edit caused the change, write that. If
          you don&apos;t, leave the line in. It&apos;s easier to edit than to defend on the call.
        </p>
      </ArticleSection>

      <ArticleSection id="actions" title="Next month">
        <p>
          Three. A page, a query, or something still open in the log. &quot;Continue optimizing&quot; isn&apos;t
          one of them.
        </p>
        <p>They can reply and change the list. A short list gets a reply.</p>
      </ArticleSection>

      <ArticleSection id="leave-out" title="What we skip">
        <p>
          Skip the 40-page query export. They won&apos;t find the three queries you mean to work on. If you
          include a rank from another tool, name the tool and the date.
        </p>
        <p>
          A Looker link can go in the email. It doesn&apos;t stand in for the write-up. An AI check goes on
          its own page, with the prompt and the model, which is written up under{" "}
          <Link href="/ai-search-mentions" className="font-semibold text-teal-800 underline">
            AI mentions
          </Link>
          .
        </p>
      </ArticleSection>
    </MarketingArticle>
  );
}
