import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { pageMeta } from "@/lib/seo";
import { PUBLIC_PAGES } from "@/lib/site-content";

export const metadata = pageMeta(PUBLIC_PAGES.terms);

export default function TermsPage() {
  return (
    <LegalPage title="Terms of service">
      <LegalSection title="The service">
        <p>
          SearchProof lets an agency log work, pull a period of Google Analytics and Search Console data
          when those accounts are connected, edit a narrative, and send a PDF or share link. The narrative
          states that the relationship between the work and the numbers is correlation. The product does
          not claim that the work caused a ranking or traffic change.
        </p>
        <p>
          Nothing is emailed until you mark the draft ready and choose to send it. You are responsible
          for the text you send and for having the right to report on that client.
        </p>
      </LegalSection>

      <LegalSection title="Accounts">
        <p>
          You must provide a working email address and keep the password private. One person may not
          share a login across agencies. You must be allowed to connect any Google account you attach,
          and to use the Analytics property and Search Console site you select.
        </p>
      </LegalSection>

      <LegalSection title="Trial and plans">
        <p>The trial lasts 14 days and includes one client. Trial PDFs and share links stay watermarked.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Creating a client on the free plan uses that slot. Deleting the client does not open another.</li>
          <li>After a report exists, that free client stays on the domain you used.</li>
          <li>Per Client is $49 per client slot each month. A slot is one client at a time.</li>
          <li>Unlimited Agency is $249 per month and includes a scheduled draft. You still mark each draft ready.</li>
        </ul>
        <p>
          Prices are shown on the{" "}
          <Link href="/pricing" className="text-teal-800 underline">
            pricing page
          </Link>{" "}
          before you pay. Payment is handled by Dodo Payments. Canceling returns the workspace to an ended
          trial. We do not offer an annual plan.
        </p>
      </LegalSection>

      <LegalSection title="Reports and Google data">
        <p>
          If Google is connected and the property pull succeeds, the report uses those figures. If it is
          not connected, or the pull fails, the report does not pretend the numbers are live. A demo
          snapshot is labeled as a demo snapshot.
        </p>
        <p>
          Google data is used only to build the report you asked for. The{" "}
          <Link href="/privacy#google-user-data" className="text-teal-800 underline">
            privacy policy
          </Link>{" "}
          describes the scopes, what is stored, and how to disconnect.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>You may not:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Connect a Google account you are not authorized to use.</li>
          <li>Send a report that presents demo numbers as live Analytics or Search Console data.</li>
          <li>Use the service to break into accounts, send spam, or host malware.</li>
          <li>Resell access to the workspace as if you were SearchProof.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Availability">
        <p>
          The service is provided as available. A failed Google pull, a failed email, or a model outage
          can leave a draft unfinished. We do not promise rankings, traffic, or that a client will renew.
        </p>
      </LegalSection>

      <LegalSection title="Ending use">
        <p>
          You may stop using the service at any time. Deleting a client removes that client&apos;s stored
          reports and Google tokens. To close the account, email{" "}
          <a className="text-teal-800 underline" href="mailto:info@getsearchproof.com">info@getsearchproof.com</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
