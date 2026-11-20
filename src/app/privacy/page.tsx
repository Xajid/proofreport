import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy policy — SearchProof",
  description:
    "How SearchProof collects, uses, and stores account data and Google Analytics and Search Console data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy">
      <LegalSection title="Who we are">
        <p>
          SearchProof (getsearchproof.com) is a monthly SEO reporting tool for freelancers and agencies.
          This policy covers the website, the workspace, and the Google account connection used to read
          Analytics and Search Console.
        </p>
        <p>
          Contact: <a className="text-teal-800 underline" href="mailto:info@getsearchproof.com">info@getsearchproof.com</a>.
        </p>
      </LegalSection>

      <LegalSection title="Account and workspace data">
        <p>When you create an account we store:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Your name, email address, and a hash of your password.</li>
          <li>Your agency name, logo, and brand color.</li>
          <li>Client name, domain, and contact email.</li>
          <li>Work-log entries you write.</li>
          <li>Report drafts, the narrative you edit, next actions, share links, and the address you send a report to.</li>
          <li>Your plan, trial end date, and the payment-provider customer id. We do not store card numbers.</li>
        </ul>
        <p>
          A session cookie keeps you signed in for up to 24 hours. It is HTTP-only. Signing out clears it.
        </p>
      </LegalSection>

      <LegalSection id="google-user-data" title="Google user data">
        <p>
          Connecting Google is optional. SearchProof requests read-only access, and only after you start
          the connection from a client page:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Google Analytics, scope <code>analytics.readonly</code>, to read the property you select.
          </li>
          <li>
            Google Search Console, scope <code>webmasters.readonly</code>, to read the site you select.
          </li>
        </ul>
        <p>From those services we read the figures needed for one reporting period, including:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Organic sessions and landing pages.</li>
          <li>Search clicks, impressions, average position, and top queries.</li>
          <li>Conversion totals for the events already configured in that Analytics property.</li>
        </ul>
        <p>We store:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>The OAuth access token and refresh token for that connection.</li>
          <li>The Analytics property id or Search Console site you picked.</li>
          <li>The metrics snapshot copied into the report you generate.</li>
        </ul>
        <p>We use that Google data only to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Show the report inside your workspace.</li>
          <li>Draft the narrative and next actions that you edit before anything is sent.</li>
          <li>Build the PDF and share page you choose to send to your client.</li>
        </ul>
        <p>
          SearchProof&apos;s use of information received from Google APIs adheres to the{" "}
          <a
            className="text-teal-800 underline"
            href="https://developers.google.com/terms/api-services-user-data-policy"
          >
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements.
        </p>
        <p>In particular:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>We do not sell Google user data.</li>
          <li>We do not use Google user data for advertising, retargeting, or credit decisions.</li>
          <li>We do not use Google user data to train a SearchProof model.</li>
          <li>
            People at SearchProof do not read your Google data unless you ask for support with a specific
            report, we need to investigate a security incident, or the law requires it.
          </li>
          <li>
            We do not transfer Google user data to others except the processors named below, and only to
            provide the report you asked for.
          </li>
        </ul>
        <p>
          If Google is not connected, the report uses a labeled demo snapshot. Demo numbers are not taken
          from your Google account and are not described as live Analytics or Search Console data.
        </p>
        <p>
          Deleting the client deletes that client&apos;s Google tokens, property selection, work logs, and
          reports. You can also stop future access by removing SearchProof in your{" "}
          <a className="text-teal-800 underline" href="https://myaccount.google.com/permissions">
            Google Account permissions
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Drafting the narrative">
        <p>
          When you generate a report, we send the metrics snapshot and the work-log text for that period
          to our model provider (NVIDIA or OpenAI, whichever is configured for the service) so it can
          draft the narrative. We do not send your Google refresh token or password. You edit the draft
          before it can be emailed. If the model is unavailable, a fixed template writes the draft instead.
        </p>
      </LegalSection>

      <LegalSection title="Payments and email">
        <p>
          Paid plans are billed by Dodo Payments. Dodo processes the card payment. We store the plan,
          the number of client slots, and Dodo&apos;s customer id.
        </p>
        <p>
          When you send a report, or ask for a password reset, we send that email through Resend. The
          message contains the report or the reset link you requested.
        </p>
      </LegalSection>

      <LegalSection title="How long we keep data">
        <p>
          We keep account, client, and report data while the workspace exists. Deleting a client removes
          its connections, tokens, work logs, and reports. To delete the whole account, email{" "}
          <a className="text-teal-800 underline" href="mailto:info@getsearchproof.com">info@getsearchproof.com</a>{" "}
          from the account address. We delete the workspace and its stored Google tokens after we confirm
          the request.
        </p>
      </LegalSection>

      <LegalSection title="Sharing">
        <p>We share data only with:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Google, when you connect Analytics or Search Console.</li>
          <li>The model provider, to draft a report you generate.</li>
          <li>Dodo Payments, to take payment.</li>
          <li>Resend, to deliver email you ask us to send.</li>
          <li>The client you address, when you mark a report ready and send it or open a share link.</li>
        </ul>
        <p>
          A share link shows that report to anyone who has the link. You create the link. The{" "}
          <Link href="/terms" className="text-teal-800 underline">
            terms
          </Link>{" "}
          describe what you are allowed to send.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
