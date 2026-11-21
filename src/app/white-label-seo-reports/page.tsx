import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArticleSection, MarketingArticle, OnThisPage } from "@/components/marketing-article";
import { cn } from "@/lib/utils";
import { PER_CLIENT_MONTHLY_USD, PUBLIC_PAGES } from "@/lib/site-content";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(PUBLIC_PAGES.whiteLabel);

export default function WhiteLabelPage() {
  return (
    <MarketingArticle
      page={PUBLIC_PAGES.whiteLabel}
      lede="The PDF goes out with your name, logo, and color. Inside is the work log, GA4, Search Console, and a write-up you edit before it sends."
    >
      <OnThisPage
        items={[
          { id: "what-the-client-sees", label: "On the PDF" },
          { id: "trial-watermark", label: "Trial files" },
          { id: "one-retainer", label: "One client, one month" },
          { id: "what-you-edit", label: "Before you send" },
        ]}
      />

      <ArticleSection id="what-the-client-sees" title="On the PDF">
        <p>
          They get the file by email, plus a view link. No login. On a paid plan the cover is your agency
          name, logo, and color. SearchProof is not in that header.
        </p>
        <p>
          The pages stay in the same order every month, so last month&apos;s file is a map for this one. The{" "}
          <Link href="/sample" className="font-semibold text-teal-800 underline">
            sample
          </Link>{" "}
          is that order: write-up, organic performance, conversions, work log, next actions.
        </p>
        <p>
          The view link still lives on getsearchproof.com. The PDF has your branding. We don&apos;t put the
          link on your domain.
        </p>
      </ArticleSection>

      <ArticleSection id="trial-watermark" title="Trial files">
        <p>
          The trial is 14 days and one client. Those PDFs, the share links, and this sample stay watermarked.
          The mark comes off when you pay for the slot, so you can walk a prospect through the layout without
          handing them a clean file.
        </p>
        <p>
          Each slot is ${PER_CLIENT_MONTHLY_USD} a month. A longer client list is the{" "}
          <Link href="/agency-seo-reporting" className="font-semibold text-teal-800 underline">
            agency plan
          </Link>
          . Both prices are on the{" "}
          <Link href="/pricing" className="font-semibold text-teal-800 underline">
            pricing page
          </Link>
          .
        </p>
      </ArticleSection>

      <ArticleSection id="one-retainer" title="One client, one month">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Log the work as you do it. Title, category, hours, and a line on what changed.</li>
          <li>Connect Google once. Pick the GA4 property and the Search Console property.</li>
          <li>Generate the draft. It lists what shipped, what moved, and a correlation line.</li>
          <li>Edit the write-up and the three next actions. Mark it ready. Then send.</li>
        </ol>
        <p>
          If Analytics or Search Console fails, generation stops and names the source. We don&apos;t fill the
          gap with demo numbers and call them live.
        </p>
      </ArticleSection>

      <ArticleSection id="what-you-edit" title="Before you send">
        <p>
          You get the shipped work, the movement in sessions, clicks, impressions, position, and conversions,
          and three next actions. Change the wording before they see it. The correlation line is there so the
          month can show work and numbers together without saying one caused the other.
        </p>
        <p>
          A Looker link in the same email is a different attachment. How the two sit together is on the{" "}
          <Link href="/searchproof-vs-looker-studio" className="font-semibold text-teal-800 underline">
            Looker page
          </Link>
          .
        </p>
        <p>
          <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>
            Start with one client
          </Link>
        </p>
      </ArticleSection>
    </MarketingArticle>
  );
}
