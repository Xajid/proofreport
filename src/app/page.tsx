import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen surface-mesh">
      <div className="hero-stage min-h-[100svh]">
        <SiteHeader />
        <section className="relative z-10 mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-12 lg:pb-24 lg:pt-10">
          <div className="animate-rise">
            <p className="font-display text-5xl font-semibold leading-[0.98] tracking-tight text-slate-950 sm:text-6xl lg:text-[4.25rem]">
              ProofReport
            </p>
            <h1 className="mt-6 max-w-xl text-[1.45rem] font-medium leading-snug text-slate-800 sm:text-[1.7rem]">
              Client-ready SEO reports that prove the work — every month.
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-600">
              Connect metrics, log the work, generate an executive narrative, and ship a branded PDF
              your clients actually read.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/register">
                <Button size="lg">Start free trial</Button>
              </Link>
              <Link href="/sample">
                <Button size="lg" variant="outline">
                  View sample report
                </Button>
              </Link>
            </div>
          </div>

          <div className="animate-rise-delay relative min-h-[360px] lg:min-h-[480px]">
            <div className="animate-float report-canvas absolute inset-0 overflow-hidden rounded-[18px] p-7 text-teal-50 sm:p-9">
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-100/75">
                <span>Monthly SEO Report</span>
                <span>Oct 2026</span>
              </div>
              <p className="mt-8 font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
                Sessions +14.2%. Clicks +9.8%. Tied to the landing-page refreshes and crawl fixes
                logged this month.
              </p>
              <div className="mt-10 grid grid-cols-3 gap-3">
                {[
                  ["Sessions", "3,842"],
                  ["Clicks", "1,904"],
                  ["Conv.", "47"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-white/10 bg-white/10 px-3 py-3 backdrop-blur-sm">
                    <p className="text-[11px] uppercase tracking-wide text-teal-100/70">{label}</p>
                    <p className="mt-1 text-xl font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 border-t border-white/10 pt-5 text-sm text-teal-50/80">
                Prepared for Bright Plumbing Co. · Northline SEO
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="border-y border-slate-200/80 bg-white/70">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">
            Proof-of-work engine
          </p>
          <h2 className="font-display mt-3 max-w-2xl text-3xl font-semibold text-slate-950 sm:text-4xl">
            From work log to client narrative in one pass.
          </h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Dashboards show charts. ProofReport ships the story that connects your hours to their
            outcomes — ready to send.
          </p>
          <ol className="mt-12 grid gap-8 md:grid-cols-4">
            {[
              ["01", "Work log", "Capture period bullets your clients can understand."],
              ["02", "Metrics", "Pull GA4 + Search Console deltas automatically."],
              ["03", "Narrative", "AI or template summary that cites both sides."],
              ["04", "Branded PDF", "Edit next actions, export, and send."],
            ].map(([n, title, body], i) => (
              <li
                key={n}
                className="animate-rise border-t border-slate-200 pt-5"
                style={{ animationDelay: `${0.05 * i}s` }}
              >
                <p className="font-mono text-xs font-medium text-teal-800">{n}</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <h2 className="font-display text-3xl font-semibold text-slate-950 sm:text-4xl">
              Built for freelancers and lean agencies.
            </h2>
            <p className="mt-4 max-w-xl text-slate-600">
              White-label branding, monthly schedule stub, optional AI mentions page, and pricing
              that scales from one client to a full roster.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-slate-700">
              {[
                "Agency logo, color, and cover branding",
                "Editable executive narrative before send",
                "Watermarked sample reports for sales conversations",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-700" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="panel p-8">
            <p className="text-sm font-semibold text-teal-800">From</p>
            <p className="font-display mt-2 text-4xl font-semibold text-slate-950">
              $49<span className="text-lg font-medium text-slate-500">/client/mo</span>
            </p>
            <p className="mt-3 text-sm text-slate-600">
              Agency seats from $199. AI visibility page as an add-on.
            </p>
            <Link href="/pricing" className="mt-6 inline-block">
              <Button className="w-full sm:w-auto">See pricing</Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-10 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-base font-semibold text-slate-800">ProofReport</p>
          <p>Enterprise client reporting for SEO operators</p>
        </div>
      </footer>
    </div>
  );
}
