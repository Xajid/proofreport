"use client";

import Link from "next/link";
import { useSession, SessionProvider } from "next-auth/react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Zap } from "lucide-react";

function PricingInner() {
  const { data: session } = useSession();

  async function checkout(plan: "per_client" | "agency") {
    if (!session) {
      window.location.href = "/register";
      return;
    }
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.redirectUrl) window.location.href = data.redirectUrl;
  }

  const plans = [
    {
      name: "Sample",
      price: "Free",
      suffix: null,
      detail: "Watermarked PDF to close prospects.",
      cta: (
        <Link href="/sample">
          <Button variant="outline" className="w-full" size="lg">
            Download sample
          </Button>
        </Link>
      ),
      features: ["Full report structure", "SAMPLE watermark", "Share in sales calls"],
      featured: false,
      badge: null,
    },
    {
      name: "Per client",
      price: "$49–$99",
      suffix: "/mo",
      detail: "Full narrative engine for freelancers.",
      cta: (
        <Button className="w-full" size="lg" onClick={() => checkout("per_client")}>
          <Zap className="h-4 w-4" />
          Start per-client
        </Button>
      ),
      features: [
        "Work log + metrics narrative",
        "Branded PDF export",
        "GA4 + GSC connectors",
        "AI mentions add-on available",
      ],
      featured: true,
      badge: "Most popular",
    },
    {
      name: "Agency seat",
      price: "$199–$499",
      suffix: "/mo",
      detail: "Shared branding for 10–25 clients.",
      cta: (
        <Button variant="secondary" className="w-full" size="lg" onClick={() => checkout("agency")}>
          Start agency
        </Button>
      ),
      features: [
        "Multi-client workspace",
        "Schedule stub",
        "Team-ready branding",
        "Priority support path",
      ],
      featured: false,
      badge: null,
    },
  ];

  return (
    <div className="min-h-screen surface-mesh">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 pb-28 pt-10">
        {/* Header */}
        <div className="max-w-2xl animate-rise mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Pricing</p>
          <h1 className="font-display mt-3 text-4xl font-semibold text-slate-950 sm:text-5xl">
            Simple plans. Client-ready output.
          </h1>
          <p className="mt-4 text-slate-500">
            Start with a free sample, then scale from a single retainer to a full agency roster.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid gap-5 lg:grid-cols-3 lg:items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-[var(--radius-lg)] border bg-white p-7 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)] ${
                plan.featured
                  ? "border-teal-600/30 shadow-[var(--shadow-md)] ring-1 ring-teal-600/15"
                  : "border-slate-200/80"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-700 px-3 py-1 text-[11px] font-semibold text-white shadow-[var(--shadow-sm)]">
                    <Zap className="h-3 w-3" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-slate-600">{plan.name}</p>
                <p className="font-display mt-3 text-4xl font-bold text-slate-950">
                  {plan.price}
                  {plan.suffix && (
                    <span className="text-lg font-medium text-slate-400">{plan.suffix}</span>
                  )}
                </p>
                <p className="mt-2 text-sm text-slate-500">{plan.detail}</p>
              </div>

              <ul className="mt-7 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${plan.featured ? "text-teal-600" : "text-slate-400"}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-8">{plan.cta}</div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="mt-10 text-center text-sm text-slate-500">
          All plans include a 14-day free trial. No credit card required to start.{" "}
          <Link href="/register" className="font-semibold text-teal-700 hover:underline">
            Get started →
          </Link>
        </p>
      </main>
    </div>
  );
}

export default function PricingPage() {
  return (
    <SessionProvider>
      <PricingInner />
    </SessionProvider>
  );
}
