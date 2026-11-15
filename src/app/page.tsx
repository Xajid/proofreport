import { SiteHeader } from "@/components/site-header";
import { LandingHeroInteractive } from "@/components/landing-hero-interactive";
import { HowItWorksInteractive } from "@/components/how-it-works-interactive";
import { LandingPricing } from "@/components/landing-pricing";
import { BrandLogo } from "@/components/brand-logo";
import {
  BarChart3,
  Shield,
  Zap,
  Users,
  Clock,
} from "lucide-react";

const WHY_CARDS = [
  {
    icon: Shield,
    title: "100% White-label",
    body: "Your agency name, logo, brand accent colors, and custom domains. Your clients will never see ProofReport anywhere.",
  },
  {
    icon: BarChart3,
    title: "Verified Google GA4 & GSC",
    body: "Official Google OAuth pulls actual organic sessions, rankings, CTR, and conversion goals directly — no CSV exports.",
  },
  {
    icon: Zap,
    title: "Causality-Focused AI Narratives",
    body: "GPT-4 turns dry metrics and your logged hours into a compelling story that justifies your retainer month after month.",
  },
];

const STATS = [
  { value: "5 mins", label: "average time to review & send", icon: Clock },
  { value: "100%", label: "white-label — your brand, not ours", icon: Shield },
  { value: "GA4 + GSC", label: "real live data, zero guesswork", icon: BarChart3 },
  { value: "14-day", label: "free trial, no credit card needed", icon: Users },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen surface-mesh">
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
                <Icon className="mb-2 h-4 w-4 text-teal-600" />
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

      {/* ── Why Agencies Choose ProofReport ── */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-14 text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
            Built strictly for SEO operators
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
            Why agencies switch to ProofReport
          </h2>
          <p className="mt-3 text-slate-500 text-[15px]">
            Traditional dashboard tools dump raw numbers that confuse clients. ProofReport builds the bridge between what you did and why their traffic moved.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {WHY_CARDS.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="panel panel-hover rounded-[var(--radius-lg)] p-8 border-slate-200/80 bg-white"
            >
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-[10px] bg-teal-50 border border-teal-100/80 text-teal-700">
                <Icon className="h-5 w-5" />
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

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-10 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <BrandLogo href="/" size="sm" />
          <p className="text-xs">
            Client reporting for SEO agencies — fast, branded, and provable.
          </p>
        </div>
      </footer>
    </div>
  );
}
