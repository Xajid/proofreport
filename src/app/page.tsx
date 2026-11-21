import { SiteHeader } from "@/components/site-header";
import { LandingHeroInteractive } from "@/components/landing-hero-interactive";
import { HowItWorksInteractive } from "@/components/how-it-works-interactive";
import { LandingPricing } from "@/components/landing-pricing";
import { GuideIndex, SiteFooter } from "@/components/site-footer";
import { JsonLd } from "@/components/json-ld";
import { faqJsonLd, pageMeta, softwareApplicationJsonLd } from "@/lib/seo";
import { PUBLIC_PAGES } from "@/lib/site-content";
import {
  BarChart3,
  Shield,
  Zap,
  Users,
  Clock,
} from "lucide-react";

export const metadata = pageMeta(PUBLIC_PAGES.home);

const WHY_CARDS = [
  {
    icon: Shield,
    title: "Your name on the PDF",
    body: "Paid reports use your agency name, logo, and brand color. Trial PDFs and share links stay watermarked.",
  },
  {
    icon: BarChart3,
    title: "GA4 and Search Console",
    body: "You pick the property after Google OAuth. If a pull fails, the report stops. Demo numbers are never labeled live.",
  },
  {
    icon: Zap,
    title: "Work, then the numbers",
    body: "The draft lists what you shipped, what moved, and states the link is correlation. You edit three next actions before send.",
  },
];

const STATS = [
  { value: "Draft first", label: "nothing sends until you mark it ready", icon: Clock },
  { value: "Your brand", label: "logo and color on paid PDFs", icon: Shield },
  { value: "GA4 + GSC", label: "live only after you select a property", icon: BarChart3 },
  { value: "14 days", label: "one client, then the trial ends", icon: Users },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen surface-mesh">
      <JsonLd data={softwareApplicationJsonLd()} />
      <JsonLd data={faqJsonLd()} />
      <main>
      <div className="hero-stage min-h-[100svh]">
        <SiteHeader />
        <LandingHeroInteractive />
      </div>

      {/* ── Social Proof Bar ── */}
      <section className="border-y border-slate-200/70 bg-white/95 backdrop-blur-sm shadow-[var(--shadow-xs)]">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <dl className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={value} className="flex flex-col items-center text-center">
                <Icon className="mb-2 h-4 w-4 text-teal-600" aria-hidden="true" />
                <dt className="font-display text-2xl font-bold text-slate-900">
                  {value}
                </dt>
                <dd className="mt-1 text-xs text-slate-500 font-medium">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Interactive 4-Step Agency Workflow ── */}
      <HowItWorksInteractive />

      {/* ── Why Agencies Choose SearchProof ── */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-14 text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
            For agencies and freelance SEOs
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
            A PDF that answers what you did
          </h2>
          <p className="mt-3 text-slate-500 text-[15px]">
            Dashboards show charts. This report puts the work log next to the GA4 and Search Console numbers for the period, and it says when that link is only correlation.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {WHY_CARDS.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="panel panel-hover rounded-[var(--radius-lg)] p-8 border-slate-200/80 bg-white"
            >
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-[10px] bg-teal-50 border border-teal-100/80 text-teal-700">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="font-display text-lg font-semibold text-slate-900">{title}</p>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-500">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing Section with Monthly/Annual Toggle & FAQs ── */}
      <LandingPricing />
      <GuideIndex />
      </main>
      <SiteFooter />
    </div>
  );
}
