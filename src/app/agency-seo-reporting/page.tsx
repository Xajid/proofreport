import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArticleSection, MarketingArticle, OnThisPage } from "@/components/marketing-article";
import { cn } from "@/lib/utils";
import { AGENCY_MONTHLY_USD, PER_CLIENT_MONTHLY_USD, PUBLIC_PAGES } from "@/lib/site-content";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(PUBLIC_PAGES.agency);

export default function AgencyReportingPage() {
  return (
    <MarketingArticle
      page={PUBLIC_PAGES.agency}
      lede="Same PDF for every retainer: work log, GA4, Search Console, and a write-up someone on the team edits before it sends. On the agency plan a job drafts last month for each client. It does not email them."
    >
      <OnThisPage
        items={[
          { id: "same-shape", label: "Same pages" },
          { id: "draft-job", label: "The draft job" },
          { id: "review", label: "You still read it" },
          { id: "which-plan", label: "Which plan" },
        ]}
      />

      <ArticleSection id="same-shape" title="Same pages">
        <p>
          Executive summary, organic performance, conversions, work log, next actions. An optional last page
          covers{" "}
          <Link href="/ai-search-mentions" className="font-semibold text-teal-800 underline">
            AI mentions
          </Link>
          . Clients learn the file by getting the same one every month.
        </p>
        <p>
          The{" "}
          <Link href="/sample" className="font-semibold text-teal-800 underline">
            sample
          </Link>{" "}
          is that order with a demo client. Paid PDFs drop the watermark and use your name, logo, and color.
        </p>
      </ArticleSection>

      <ArticleSection id="draft-job" title="The draft job">
        <p>
          Once a month the job drafts last month for each client from the work log and the metrics. Someone
          still opens it, edits it, and marks it ready.
        </p>
        <p>
          If Google fails for one client, that draft stops and names the source. The other clients are left
          alone. We don&apos;t drop in placeholder charts.
        </p>
      </ArticleSection>

      <ArticleSection id="review" title="You still read it">
        <p>
          The draft says what shipped, what moved, and that the link is correlation unless you rewrite that
          line. It can be accurate and still sound wrong for that client. Read it before it goes out.
        </p>
        <p>Clients don&apos;t get accounts. They get the PDF and a view link. Your team is who logs in.</p>
      </ArticleSection>

      <ArticleSection id="which-plan" title="Which plan">
        <p>
          A few retainers: ${PER_CLIENT_MONTHLY_USD} a month per client, including a freelancer who wants{" "}
          <Link href="/white-label-seo-reports" className="font-semibold text-teal-800 underline">
            their name on the PDF
          </Link>
          . The whole list, plus the draft job: ${AGENCY_MONTHLY_USD} a month. You still mark each report ready.
        </p>
        <p>
          Trial is 14 days and one client. Prices are on the{" "}
          <Link href="/pricing" className="font-semibold text-teal-800 underline">
            pricing page
          </Link>
          .
        </p>
        <p>
          If the retainer already includes a Looker board, keep the link. This file is the monthly email.
          The{" "}
          <Link href="/searchproof-vs-looker-studio" className="font-semibold text-teal-800 underline">
            Looker note
          </Link>{" "}
          is the longer version of that.
        </p>
        <p>
          <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>
            Start the agency trial
          </Link>
        </p>
      </ArticleSection>
    </MarketingArticle>
  );
}
