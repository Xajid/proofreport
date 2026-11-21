"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FaqList } from "@/components/faq-list";
import { Button } from "@/components/ui/button";
import { AGENCY_MONTHLY_USD, PER_CLIENT_MONTHLY_USD } from "@/lib/site-content";
import { CheckCircle2, Zap, Shield, ArrowRight, AlertCircle } from "lucide-react";

function PricingInner() {
  const { data: session } = useSession();
  const search = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [clientQuantity, setClientQuantity] = useState(1);

  const cancelled = search.get("checkout") === "cancel";
  const needsAnotherClient = search.get("upgrade") === "clients";

  async function checkout(plan: "per_client" | "agency") {
    if (!session) {
      window.location.href = "/register";
      return;
    }
    setLoading(plan);
    setError("");
    try {
      const res = await fetch("/api/dodo/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          quantity: plan === "per_client" ? clientQuantity : 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(null);
        return;
      }
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        setError("No checkout URL returned. Please check your billing configuration.");
        setLoading(null);
      }
    } catch {
      setError("Network error — please check your connection and try again.");
      setLoading(null);
    }
  }

  const plans = [
    {
      id: "sample" as const,
      name: "Free Sample",
      price: "$0",
      suffix: null,
      detail: "Watermarked PDF to close prospects in sales calls.",
      cta: (
        <Link href="/sample">
          <Button variant="outline" className="w-full" size="lg">
            Download sample
          </Button>
        </Link>
      ),
      features: [
        "Full report structure",
        "SAMPLE watermark on PDF",
        "Share link for sales calls",
        "1 active client domain",
      ],
      featured: false,
      badge: null,
    },
    {
      id: "per_client" as const,
      name: "Per Client",
      price: `$${PER_CLIENT_MONTHLY_USD}`,
      suffix: "/client/mo",
      detail: "Full narrative engine for freelancers & boutique agencies.",
      cta: (
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-600" htmlFor="client-slots">
            Client slots at ${PER_CLIENT_MONTHLY_USD} each
            <input
              id="client-slots"
              type="number"
              min={1}
              max={100}
              inputMode="numeric"
              value={clientQuantity}
              onChange={(e) => setClientQuantity(Math.min(100, Math.max(1, Number(e.target.value) || 1)))}
              className="mt-1.5 h-10 w-full rounded-[8px] border border-slate-200 px-3 text-sm text-slate-900"
            />
          </label>
        <Button
          className="w-full"
          size="lg"
          onClick={() => checkout("per_client")}
          disabled={loading === "per_client"}
        >
          {loading === "per_client" ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Redirecting…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Get started
            </span>
          )}
        </Button>
        </div>
      ),
      features: [
        "Work log plus an editable narrative",
        "Branded PDF with the watermark removed",
        "Live GA4 and Search Console after you pick a property",
        "Email the PDF and a share link",
        "One paid slot per client you add at checkout",
      ],
      featured: true,
      badge: "Most popular",
    },
    {
      id: "agency" as const,
      name: "Unlimited Agency",
      price: `$${AGENCY_MONTHLY_USD}`,
      suffix: "/mo",
      detail: "Unlimited clients. The monthly job drafts last month's report for you to review.",
      cta: (
        <Button
          variant="secondary"
          className="w-full"
          size="lg"
          onClick={() => checkout("agency")}
          disabled={loading === "agency"}
        >
          {loading === "agency" ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Redirecting…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Start agency plan
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      ),
      features: [
        "Everything in Per Client",
        "Unlimited client domains",
        "Monthly draft on your schedule day — you still mark it ready",
        "Your logo and brand color on the PDF",
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
            Per client, or the whole list
          </h1>
          <p className="mt-4 text-slate-500">
            ${PER_CLIENT_MONTHLY_USD} a month for each client slot. ${AGENCY_MONTHLY_USD} a month if every
            client is on one plan. Trial is 14 days and one client.
          </p>
        </div>

        {/* Cancel notice */}
        {needsAnotherClient && (
          <div className="mb-8 flex items-start gap-3 rounded-[10px] border border-teal-200 bg-teal-50 px-5 py-3.5 text-sm text-teal-900 animate-scale-in">
            <Zap className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              The free plan includes one client. Choose Per Client or Agency below to add another.
            </p>
          </div>
        )}

        {cancelled && (
          <div className="mb-8 flex items-center gap-3 rounded-[10px] border border-amber-200 bg-amber-50 px-5 py-3.5 text-sm text-amber-800 animate-scale-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Checkout was cancelled. No charges were made — pick a plan whenever you&apos;re ready.
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mb-8 flex items-center gap-3 rounded-[10px] border border-red-200 bg-red-50 px-5 py-3.5 text-sm text-red-700 animate-scale-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Plan cards */}
        <div className="grid gap-5 lg:grid-cols-3 lg:items-start">
          {plans.map((plan) => (
            <div
              key={plan.id}
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

        {/* Trust footer */}
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Shield className="h-4 w-4 text-teal-600" />
            Secure checkout powered by Dodo Payments · Cancel anytime
          </div>
          <p className="text-sm text-slate-500">
            All plans include a 14-day free trial. No credit card required to start.{" "}
            <Link href="/register" className="font-semibold text-teal-700 hover:underline">
              Get started →
            </Link>
          </p>
        </div>

        <FaqList level={2} />
      </main>
      <SiteFooter />
    </div>
  );
}

export function PricingCheckout() {
  return (
    <Suspense>
      <PricingInner />
    </Suspense>
  );
}
