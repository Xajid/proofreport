"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Zap, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const FAQS = [
  {
    q: "Do my clients see SearchProof branding anywhere?",
    a: "Never. Reports display your agency name, logo, primary brand color, and contact info. Public share links and PDFs are 100% white-labeled.",
  },
  {
    q: "Do clients need to create an account or sign in?",
    a: "No. Your clients never have to log in. They receive a clean PDF in their email and a direct, secure view link (e.g. yourdomain.com/share/token).",
  },
  {
    q: "How does the Google Analytics 4 & Search Console connection work?",
    a: "You authenticate once with Google OAuth from your client settings. SearchProof securely pulls verified organic clicks, impressions, sessions, and conversions automatically.",
  },
  {
    q: "Can I edit the AI executive narrative before sending?",
    a: "Yes, 100%. The AI writes the initial draft tying your work to the numbers, and you have a full split-screen live PDF preview editor to tweak anything before sending.",
  },
];

export function LandingPricing() {
  const [annual, setAnnual] = useState(false);

  const plans = [
    {
      id: "starter",
      name: "Starter Trial",
      badge: "Free 14 days",
      badgeTone: "bg-slate-100 text-slate-700 border-slate-200",
      price: "$0",
      suffix: "/14 days",
      subtext: "Perfect for testing SearchProof on your first client.",
      featured: false,
      ctaText: "Start free trial",
      ctaLink: "/register",
      ctaVariant: "outline" as const,
      features: [
        "1 active client domain",
        "Full AI narrative engine",
        "GA4 + Search Console connector",
        "Interactive PDF live preview",
        "Sample watermark on export",
      ],
    },
    {
      id: "per_client",
      name: "Per Client",
      badge: "Most Popular",
      badgeTone: "bg-teal-50 text-teal-800 border-teal-200 ring-1 ring-teal-600/20",
      price: annual ? "$39" : "$49",
      suffix: "/client/mo",
      subtext: "For freelancers & boutique agencies running monthly retainers.",
      featured: true,
      ctaText: "Get started",
      ctaLink: "/register",
      ctaVariant: "default" as const,
      features: [
        "Pay only for clients you manage",
        "100% white-labeled PDF (no watermark)",
        "Custom agency logo & brand colors",
        "Verified GA4 & Search Console sync",
        "AI executive narrative generation",
        "Send directly to client email (Resend)",
        "Public web report share links",
        "Work log & hours tracking",
      ],
    },
    {
      id: "agency",
      name: "Unlimited Agency",
      badge: "Full Roster",
      badgeTone: "bg-indigo-50 text-indigo-800 border-indigo-200",
      price: annual ? "$199" : "$249",
      suffix: "/mo",
      subtext: "For growing agencies managing unlimited client accounts.",
      featured: false,
      ctaText: "Start agency plan",
      ctaLink: "/register",
      ctaVariant: "secondary" as const,
      features: [
        "Unlimited client domains",
        "Everything in Per Client",
        "Automated monthly cron scheduler",
        "Search & status filtering portfolio",
        "Custom AI Engine citation checks",
        "Historical 6-month visual trends",
        "Priority agency support",
      ],
    },
  ];

  return (
    <section className="border-t border-slate-200/70 bg-white/90 backdrop-blur-sm py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
            Simple, Transparent Pricing
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
            Choose the plan that fits your roster.
          </h2>
          <p className="mt-3 text-slate-500 text-[15px]">
            Every plan includes a 14-day free trial. No credit card required to start.
          </p>

          {/* Billing Cadence Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50/80 p-1 shadow-[var(--shadow-xs)]">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                !annual
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Monthly billing
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                annual
                  ? "bg-teal-700 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Annual billing
              <span className={`text-[10px] uppercase tracking-wider font-bold rounded-full px-1.5 py-0.2 ${annual ? "bg-white/20 text-white" : "bg-teal-100 text-teal-800"}`}>
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* 3-Card Grid */}
        <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-[20px] p-8 transition-all ${
                plan.featured
                  ? "border-2 border-teal-600/40 bg-white shadow-[var(--shadow-lg)] ring-1 ring-teal-600/10 lg:-translate-y-2"
                  : "border border-slate-200/80 bg-white/70 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]"
              }`}
            >
              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="font-display text-lg font-semibold text-slate-900">
                  {plan.name}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${plan.badgeTone}`}
                >
                  {plan.featured && <Zap className="h-3 w-3 text-teal-600" />}
                  {plan.badge}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold tracking-tight text-slate-950">
                  {plan.price}
                </span>
                <span className="text-sm font-medium text-slate-500">
                  {plan.suffix}
                </span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-slate-500 min-h-[34px]">
                {plan.subtext}
              </p>

              {/* Feature List */}
              <ul className="mt-8 flex-1 space-y-3 border-t border-slate-100 pt-6">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2
                      className={`h-4 w-4 shrink-0 mt-0.5 ${
                        plan.featured ? "text-teal-600" : "text-slate-400"
                      }`}
                    />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <div className="mt-8 pt-4">
                <Link href={plan.ctaLink} className="block">
                  <Button
                    variant={plan.ctaVariant}
                    className="w-full font-semibold shadow-xs"
                    size="lg"
                  >
                    {plan.ctaText}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee Banner */}
        <div className="mt-12 rounded-[14px] border border-slate-200/80 bg-slate-50/60 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-teal-700 shrink-0" />
            <span>
              <strong>Zero-risk trial:</strong> Full access to PDF generation and GA4 sync. No credit card required. Cancel anytime.
            </span>
          </div>
          <Link
            href="/sample"
            className="font-semibold text-teal-700 hover:text-teal-900 hover:underline shrink-0"
          >
            Preview sample PDF →
          </Link>
        </div>

        {/* FAQs */}
        <div className="mt-20 pt-16 border-t border-slate-200/80">
          <div className="text-center mb-10">
            <h3 className="font-display text-2xl font-semibold text-slate-900">
              Frequently asked questions
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Everything you need to know about SearchProof for agencies.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="rounded-[14px] border border-slate-200/70 bg-white p-6 shadow-xs"
              >
                <div className="flex items-start gap-2.5">
                  <HelpCircle className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{faq.q}</p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

