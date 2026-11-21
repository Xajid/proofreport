import Link from "next/link";
import { ArticleSection, DataTable, MarketingArticle, OnThisPage } from "@/components/marketing-article";
import { PUBLIC_PAGES } from "@/lib/site-content";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(PUBLIC_PAGES.comparison);

const ROWS: { topic: string; looker: string; searchproof: string }[] = [
  {
    topic: "What they open",
    looker: "A Looker Studio link.",
    searchproof: "A PDF for the month, and a view link. No login.",
  },
  {
    topic: "The work",
    looker: "You talk through it, or you keep a doc next to the board.",
    searchproof: "Its own page: category, hours, and a note.",
  },
  {
    topic: "The write-up",
    looker: "Whatever you say on the call.",
    searchproof: "A draft you edit. It includes a line that the movement is correlation.",
  },
  {
    topic: "Google data",
    looker: "Charts you build and keep connected.",
    searchproof: "You pick the GA4 and Search Console properties. A failed pull stops that report.",
  },
  {
    topic: "Whose name is on it",
    looker: "Looker's, unless you theme it or export slides yourself.",
    searchproof: "Yours on a paid PDF. Trial files stay watermarked.",
  },
  {
    topic: "After you send it",
    looker: "The board keeps updating.",
    searchproof: "The PDF stays as sent. Next month is a new draft.",
  },
];

export default function ComparisonPage() {
  return (
    <MarketingArticle
      page={PUBLIC_PAGES.comparison}
      lede="Some clients want a board they can open on a Tuesday. Some want a file that says what you did last month. We make the file. A lot of agencies still send the Looker link as well."
    >
      <OnThisPage
        items={[
          { id: "side-by-side", label: "Side by side" },
          { id: "keep-looker", label: "If they already have a board" },
          { id: "send-the-pdf", label: "The monthly email" },
          { id: "what-it-is-not", label: "If they ask for a live board" },
        ]}
      />

      <ArticleSection id="side-by-side" title="Side by side">
        <p>This is about the thing in the client&apos;s inbox at the end of the month. Not a chart-type checklist.</p>
        <DataTable caption="Looker Studio and a SearchProof PDF, for the same monthly check-in.">
          <thead>
            <tr>
              <th scope="col" className="border-b border-slate-200 px-4 py-2 font-semibold text-slate-900">
                Question
              </th>
              <th scope="col" className="border-b border-slate-200 px-4 py-2 font-semibold text-slate-900">
                Looker Studio
              </th>
              <th scope="col" className="border-b border-slate-200 px-4 py-2 font-semibold text-slate-900">
                SearchProof
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.topic}>
                <th scope="row" className="border-b border-slate-100 px-4 py-3 align-top font-medium text-slate-900">
                  {row.topic}
                </th>
                <td className="border-b border-slate-100 px-4 py-3 align-top">{row.looker}</td>
                <td className="border-b border-slate-100 px-4 py-3 align-top">{row.searchproof}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </ArticleSection>

      <ArticleSection id="keep-looker" title="If they already have a board">
        <p>
          Leave the Looker link up if someone checks the property between reports. A PDF from the 2nd does
          not move when a landing page picks up on the 18th.
        </p>
        <p>
          We don&apos;t import a Looker report, and we don&apos;t embed one. If they already like the board,
          keep sending the link.
        </p>
      </ArticleSection>

      <ArticleSection id="send-the-pdf" title="The monthly email">
        <p>
          Use the PDF when the meeting is the retainer: what shipped, what moved, what you&apos;re doing next.
          The work log is already in the file. The account lead can cut a line before it goes out.
        </p>
        <p>
          The{" "}
          <Link href="/sample" className="font-semibold text-teal-800 underline">
            sample
          </Link>{" "}
          is the file.{" "}
          <Link href="/monthly-seo-report" className="font-semibold text-teal-800 underline">
            What goes in it
          </Link>{" "}
          is the page order and the correlation line. They don&apos;t need a Google account to open either.
        </p>
      </ArticleSection>

      <ArticleSection id="what-it-is-not" title="If they ask for a live board">
        <p>
          Send them to Looker Studio. There&apos;s no chart explorer here, and the link you already sent does
          not keep updating. SearchProof is the write-up that can go in the same email.
        </p>
        <p>
          The{" "}
          <Link href="/agency-seo-reporting" className="font-semibold text-teal-800 underline">
            agency plan
          </Link>{" "}
          drafts one of these per client. One retainer, with your logo on the file, is the{" "}
          <Link href="/white-label-seo-reports" className="font-semibold text-teal-800 underline">
            per-client setup
          </Link>
          .
        </p>
      </ArticleSection>
    </MarketingArticle>
  );
}
