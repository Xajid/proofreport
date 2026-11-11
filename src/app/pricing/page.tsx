"use client";

import Link from "next/link";
import { useSession, SessionProvider } from "next-auth/react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

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
      detail: "Watermarked PDF to close prospects.",
      cta: (
        <Link href="/sample">
          <Button variant="outline" className="w-full">
            Download sample
          </Button>
        </Link>
      ),
      features: ["Full report structure", "SAMPLE watermark", "Share in sales calls"],
      featured: false,
    },
    {
      name: "Per client",
      price: "$49–$99",
      suffix: "/mo",
      detail: "Full narrative engine for freelancers.",
      cta: (
        <Button className="w-full" onClick={() => checkout("per_client")}>
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
    },
    {
      name: "Agency seat",
      price: "$199–$499",
      suffix: "/mo",
      detail: "Shared branding for 10–25 clients.",
      cta: (
        <Button variant="secondary" className="w-full" onClick={() => checkout("agency")}>
          Start agency
        </Button>
      ),
      features: ["Multi-client workspace", "Schedule stub", "Team-ready branding", "Priority support path"],
      featured: false,
    },
  ];

  return (
    <div className="min-h-screen surface-mesh">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10">
        <div className="max-w-2xl animate-rise">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">Pricing</p>
          <h1 className="font-display mt-3 text-4xl font-semibold text-slate-950 sm:text-5xl">
            Simple plans. Client-ready output.
          </h1>
          <p className="mt-4 text-slate-600">
            Start with a free sample, then scale from a single retainer to a full agency roster.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`panel flex flex-col p-6 ${
                plan.featured ? "border-teal-700/40 ring-1 ring-teal-700/15 shadow-[var(--shadow-md)]" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-teal-800">{plan.name}</p>
                {plan.featured ? (
                  <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-800">
                    Most popular
                  </span>
                ) : null}
              </div>
              <p className="font-display mt-4 text-3xl font-semibold text-slate-950">
                {plan.price}
                {plan.suffix ? (
                  <span className="text-base font-medium text-slate-500">{plan.suffix}</span>
                ) : null}
              </p>
              <p className="mt-2 text-sm text-slate-600">{plan.detail}</p>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm text-slate-700">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-700" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">{plan.cta}</div>
            </div>
          ))}
        </div>
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
