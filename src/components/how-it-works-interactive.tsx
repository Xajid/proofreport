"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import {
  UserPlus,
  Link2,
  ListTodo,
  Send,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const STEPS = [
  {
    num: "01",
    title: "Add your client",
    short: "Domain & contact setup",
    desc: "Set the client's name, primary domain, and contact email. Toggle AI Engine citations (ChatGPT, Perplexity, Gemini) with one click.",
    icon: UserPlus,
    badge: "15 seconds",
    preview: {
      title: "New Client Profile",
      subtitle: "Workspace: Northline SEO",
      items: [
        { label: "Client Name", val: "Bright Plumbing Co." },
        { label: "Target Domain", val: "brightplumbing.example" },
        { label: "Recipient", val: "owner@brightplumbing.example" },
        { label: "AI Mentions", val: "Enabled (ChatGPT, Perplexity)" },
      ],
    },
  },
  {
    num: "02",
    title: "Connect Google",
    short: "GA4 & Search Console sync",
    desc: "One-click OAuth links Google Analytics 4 and Google Search Console. SearchProof fetches verified clicks, impressions, sessions, and conversions.",
    icon: Link2,
    badge: "Official OAuth",
    preview: {
      title: "Data Connections",
      subtitle: "Live Google API token active",
      items: [
        { label: "GA4 Property", val: "Bright Plumbing (ID: 389210291) · Connected" },
        { label: "Search Console", val: "sc-domain:brightplumbing.example · Verified" },
        { label: "Token Refresh", val: "Automatic background sync" },
        { label: "Data Integrity", val: "100% verified source metrics" },
      ],
    },
  },
  {
    num: "03",
    title: "Log your monthly work",
    short: "Connect activity to results",
    desc: "Record what your team actually delivered this month: technical fixes, content refreshes, link acquisitions, and tracked hours.",
    icon: ListTodo,
    badge: "Proof of work",
    preview: {
      title: "Completed Work Log",
      subtitle: "3 items logged · 14.5 total hours",
      items: [
        { label: "Content (6.0h)", val: "18 localized service page refreshes & FAQs" },
        { label: "Technical (4.5h)", val: "Schema markup & Core Web Vitals speed audit" },
        { label: "Authority (4.0h)", val: "5 high-intent regional directory placements" },
      ],
    },
  },
  {
    num: "04",
    title: "Generate, review & send",
    short: "Executive PDF to client inbox",
    desc: "AI produces an executive narrative explaining metric deltas through the lens of your work. Review in split-screen, then send with attached PDF.",
    icon: Send,
    badge: "Client-ready",
    preview: {
      title: "Client Delivery",
      subtitle: "PDF generated & delivered",
      items: [
        { label: "Executive Story", val: "Organic sessions +14.2% tied to content updates" },
        { label: "Report Format", val: "Branded PDF + white-label /share link" },
        { label: "Delivery", val: "Delivered via Resend to client inbox" },
        { label: "Client Reaction", val: "\"Best agency report we have ever received.\"" },
      ],
    },
  },
];

export function HowItWorksInteractive() {
  const [activeStep, setActiveStep] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (previewRef.current) {
      gsap.fromTo(
        previewRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );
    }
  }, [activeStep]);

  const current = STEPS[activeStep];

  return (
    <section className="border-b border-slate-200/70 bg-white/90 backdrop-blur-sm py-20">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="mb-14 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
            How agencies work in SearchProof
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
            From raw work logs to client PDF in four steps.
          </h2>
          <p className="mt-3 text-slate-500 text-[15px]">
            No messy spreadsheets or confusing 20-page dashboards your clients never open.
          </p>
        </div>

        {/* 2-Column Interactive Walkthrough */}
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          {/* Step List */}
          <div className="space-y-3">
            {STEPS.map((step, idx) => {
              const isActive = idx === activeStep;
              const Icon = step.icon;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={`w-full text-left rounded-[14px] p-5 transition-all cursor-pointer border ${
                    isActive
                      ? "bg-slate-950 text-white border-slate-900 shadow-[var(--shadow-md)]"
                      : "bg-white text-slate-800 border-slate-200/80 hover:border-teal-300 hover:bg-slate-50/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`font-mono text-xs font-bold px-2 py-0.5 rounded-[5px] ${
                          isActive
                            ? "bg-teal-500 text-slate-950"
                            : "bg-slate-100 text-teal-700"
                        }`}
                      >
                        {step.num}
                      </span>
                      <Icon className={`h-4 w-4 ${isActive ? "text-teal-400" : "text-slate-400"}`} />
                      <p className="font-display text-base font-semibold">
                        {step.title}
                      </p>
                    </div>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-white/10 text-teal-300"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {step.badge}
                    </span>
                  </div>

                  <p
                    className={`mt-2.5 text-xs sm:text-[13px] leading-relaxed pl-8 ${
                      isActive ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    {step.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Interactive Preview Panel */}
          <div className="rounded-[20px] border border-slate-200 bg-slate-900 p-6 text-white shadow-[var(--shadow-lg)]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-400" />
                <span className="font-semibold text-slate-300">
                  Step {current.num}: {current.title}
                </span>
              </div>
              <span className="font-mono text-[11px] text-teal-400">{current.short}</span>
            </div>

            <div ref={previewRef} className="pt-5 space-y-4">
              <div>
                <p className="font-display text-lg font-semibold text-white">
                  {current.preview.title}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {current.preview.subtitle}
                </p>
              </div>

              <div className="rounded-[12px] border border-white/10 bg-white/5 p-4 space-y-3">
                {current.preview.items.map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-slate-400 font-medium">{item.label}</span>
                    <span className="text-white font-mono text-[11px] font-semibold">{item.val}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-[10px] bg-teal-950/60 border border-teal-800/40 p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-teal-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                  <span>Verified agency outcome</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => (prev + 1) % STEPS.length)}
                  className="inline-flex items-center gap-1 font-semibold text-teal-300 hover:text-white transition-colors"
                >
                  Next step <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
