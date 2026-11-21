import Link from "next/link";
import { ArticleSection, MarketingArticle, OnThisPage } from "@/components/marketing-article";
import { PUBLIC_PAGES } from "@/lib/site-content";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(PUBLIC_PAGES.mentions);

export default function AiSearchMentionsPage() {
  return (
    <MarketingArticle
      page={PUBLIC_PAGES.mentions}
      lede="You run a prompt. We save the answer. The page shows the prompt, the model, whether the brand was named, and any URLs in that answer. It's the last page of the PDF, and only if you turn it on for that report."
    >
      <OnThisPage
        items={[
          { id: "what-is-recorded", label: "What's saved" },
          { id: "how-to-present", label: "On the call" },
          { id: "what-not-to-claim", label: "The count" },
          { id: "where-it-sits", label: "Where it sits" },
        ]}
      />

      <ArticleSection id="what-is-recorded" title="What's saved">
        <p>
          Prompt, model name, mentioned or not, and the URLs that showed up in the answer. If the answer
          named them, the row says mentioned. If it didn&apos;t, the row says not mentioned.
        </p>
        <p>
          Pick prompts a customer would type. &quot;Emergency plumber downtown&quot; is usable.
          &quot;Write something nice about our client&quot; is a problem, because the prompt is printed on
          the page.
        </p>
      </ArticleSection>

      <ArticleSection id="how-to-present" title="On the call">
        <p>
          Say what they&apos;re looking at before they turn it into a score. One saved answer, from one
          model, from the check you ran for this report.
        </p>
        <p>
          Show the prompt as you sent it. Show the model. Two models often disagree on the same wording.
          Show the URLs when the answer had any, and say when it had none.
        </p>
        <p>
          Keep the misses. A page of only the prompts that mentioned them doesn&apos;t say whether you ran
          three or thirty.
        </p>
      </ArticleSection>

      <ArticleSection id="what-not-to-claim" title="The count">
        <p>
          One answer is one answer. Run the same prompt next week and it can differ. Don&apos;t call it a
          rank, or proof they show up in AI search.
        </p>
        <p>
          Leave the count off the summary. Sessions are the whole month from Analytics. This is a handful of
          prompts. The{" "}
          <Link href="/monthly-seo-report" className="font-semibold text-teal-800 underline">
            report notes
          </Link>{" "}
          keep them on separate pages for that reason.
        </p>
      </ArticleSection>

      <ArticleSection id="where-it-sits" title="Where it sits">
        <p>
          After the work log and the next actions. The{" "}
          <Link href="/sample" className="font-semibold text-teal-800 underline">
            sample PDF
          </Link>{" "}
          leaves it off. When it&apos;s on, you get a count of checks and a count that named the brand.
        </p>
        <p>
          Everything before it is unchanged: GA4, Search Console, the work log. Agencies running this for a
          list of clients start from{" "}
          <Link href="/agency-seo-reporting" className="font-semibold text-teal-800 underline">
            the agency plan
          </Link>
          .
        </p>
      </ArticleSection>
    </MarketingArticle>
  );
}
