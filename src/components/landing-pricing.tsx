"use client";

import Link from "next/link";
import { CheckCircle2, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaqList } from "@/components/faq-list";
import { PER_CLIENT_MONTHLY_USD, AGENCY_MONTHLY_USD } from "@/lib/site-content";

export function LandingPricing() {
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
        "1 client for 14 days",
        "Editable narrative draft",
        "GA4 and Search Console, or a labeled demo snapshot",
        "PDF preview before you send",
        "Watermark on the PDF and share link",
      ],
    },
    {
      id: "per_client",
      name: "Per Client",
      badge: "Most Popular",
      badgeTone: "bg-teal-50 text-teal-800 border-teal-200 ring-1 ring-teal-600/20",
      price: `$${PER_CLIENT_MONTHLY_USD}`,
      suffix: "/client/mo",
      subtext: "For freelancers & boutique agencies running monthly retainers.",
      featured: true,
      ctaText: "Get started",
      ctaLink: "/register",
      ctaVariant: "default" as const,
      features: [
        "Buy a slot for each client at checkout",
        "PDF without the trial watermark",
        "Your logo and brand color",
        "Live GA4 and Search Console after you pick a property",
        "Narrative draft you edit before send",
        "Email the PDF and a share link",
        "Work log with hours",
      ],
    },
    {
      id: "agency",
      name: "Unlimited Agency",
      badge: "Full Roster",
      badgeTone: "bg-indigo-50 text-indigo-800 border-indigo-200",
      price: `$${AGENCY_MONTHLY_USD}`,
      suffix: "/mo",
      subtext: "For growing agencies managing unlimited client accounts.",
      featured: false,
      ctaText: "Start agency plan",
      ctaLink: "/register",
      ctaVariant: "secondary" as const,
      features: [
        "Unlimited client domains",
        "Everything in Per Client",
        "A monthly job that drafts last month's report",
        "You still review and mark each draft ready",
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

          <p className="mt-6 text-xs font-medium text-slate-500">Monthly billing. Choose how many client slots to buy on the pricing page.</p>
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

        <FaqList level={3} />
      </div>
    </section>
  );
}

