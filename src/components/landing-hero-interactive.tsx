"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const BRAND_THEMES = [
  { id: "teal", label: "Northline Teal", primary: "#0D6E68", accent: "#14b8a6", bgGradient: "from-teal-900/90 via-teal-950/95 to-slate-950" },
  { id: "indigo", label: "Apex Indigo", primary: "#4338CA", accent: "#818cf8", bgGradient: "from-indigo-950/95 via-slate-950 to-slate-950" },
  { id: "emerald", label: "Verdant SEO", primary: "#059669", accent: "#34d399", bgGradient: "from-emerald-950/95 via-slate-950 to-slate-950" },
  { id: "charcoal", label: "Monolith Media", primary: "#334155", accent: "#94a3b8", bgGradient: "from-slate-900 via-slate-950 to-black" },
];

export function LandingHeroInteractive() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLParagraphElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Interactive card state
  const [activeTab, setActiveTab] = useState<"summary" | "worklog" | "metrics">("summary");
  const [selectedTheme, setSelectedTheme] = useState(BRAND_THEMES[0]);

  // Animated counters
  const counterValues = { sessions: 3842, clicks: 1904, conv: 47 };

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      // Hero Entrance Timeline
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(badgeRef.current, { y: -12, duration: 0.6 })
        .from(headlineRef.current, { y: 24, duration: 0.8 }, "-=0.3")
        .from(subheadRef.current, { y: 16, duration: 0.7 }, "-=0.5")
        .from(ctaRef.current, { y: 12, duration: 0.6 }, "-=0.4")
        .from(cardRef.current, { y: 20, duration: 0.8 }, "-=0.5");
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative z-10 mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-14 lg:pb-24 lg:pt-10"
    >
      {/* ── Left: Copy & CTAs ── */}
      <div>
        {/* Badge */}
        <div
          ref={badgeRef}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-200/60 bg-teal-50/80 px-3.5 py-1.5 text-xs font-semibold text-teal-800 backdrop-blur-sm shadow-[var(--shadow-xs)]"
        >
          <span className="status-dot status-dot-pulse bg-teal-500" />
          Monthly proof of work for SEO freelancers
        </div>

        {/* Headline */}
        <h1
          ref={headlineRef}
          className="font-display text-4xl font-semibold leading-[1.02] tracking-tight text-slate-950 sm:text-5xl lg:text-[4.2rem]"
        >
          Monthly SEO reports your clients{" "}
          <span className="relative inline-block text-teal-800">
            actually read.
            <svg
              className="absolute -bottom-1 left-0 w-full text-teal-500/40"
              height="8"
              viewBox="0 0 100 8"
              preserveAspectRatio="none"
              fill="none"
            >
              <path d="M0 7C25 1 75 1 100 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </span>
        </h1>

        {/* Subheadline */}
        <p
          ref={subheadRef}
          className="mt-6 max-w-lg text-[16px] leading-relaxed text-slate-600 sm:text-[17px]"
        >
          Log what you shipped, pull GA4 and Search Console, and edit a narrative that labels correlation.
          Then export a branded PDF. Nothing is emailed until you mark the draft ready.
        </p>

        {/* CTAs */}
        <div ref={ctaRef} className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/register">
            <Button size="lg" className="shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all">
              Start 14-day free trial
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/sample">
            <Button size="lg" variant="outline" className="border-slate-300 hover:bg-slate-50">
              Download sample PDF
            </Button>
          </Link>
        </div>

        {/* Trust line */}
        <p ref={trustRef} className="mt-5 text-xs font-medium text-slate-400">
          No card to start · GA4 and Search Console · Watermark until you upgrade
        </p>
      </div>

      {/* ── Right: Live Interactive Report Mockup ── */}
      <div ref={cardRef} className="relative">
        {/* Glow behind */}
        <div
          className="absolute -inset-2 rounded-[24px] blur-2xl opacity-40 transition-colors duration-700"
          style={{ backgroundColor: selectedTheme.primary }}
        />

        <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-[#0d131f] text-slate-200 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)]">
          {/* Card Header & Controls */}
          <div className="border-b border-white/10 bg-slate-950/60 px-5 py-3.5 backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-[6px] text-xs font-bold text-white shadow-sm transition-colors duration-500"
                  style={{ backgroundColor: selectedTheme.primary }}
                >
                  PR
                </div>
                <div>
                  <p className="text-xs font-semibold text-white leading-none">
                    Bright Plumbing Co.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Prepared by <span className="text-white font-medium">{selectedTheme.label}</span>
                  </p>
                </div>
              </div>

              {/* View mode toggle */}
              <div className="flex items-center rounded-lg bg-white/5 p-0.5 border border-white/10 text-[11px]">
                <button
                  type="button"
                  onClick={() => setActiveTab("summary")}
                  className={`rounded-[6px] px-2.5 py-1 font-medium transition-all ${
                    activeTab === "summary"
                      ? "bg-white/15 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Narrative
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("metrics")}
                  className={`rounded-[6px] px-2.5 py-1 font-medium transition-all ${
                    activeTab === "metrics"
                      ? "bg-white/15 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Metrics
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("worklog")}
                  className={`rounded-[6px] px-2.5 py-1 font-medium transition-all ${
                    activeTab === "worklog"
                      ? "bg-white/15 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Work log
                </button>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 sm:p-7">
            {/* Top Period & Provenance Badge */}
            <div className="flex items-center justify-between text-xs text-slate-400 pb-4 border-b border-white/10">
              <span className="font-mono text-[11px] uppercase tracking-wider text-teal-400/90 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Sample figures
              </span>
              <span>October 2026 Reporting Run</span>
            </div>

            {/* TAB 1: EXECUTIVE NARRATIVE */}
            {activeTab === "summary" && (
              <div className="space-y-5 pt-5 animate-fade-in">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 mb-2">
                    <Sparkles className="h-3 w-3" />
                    Narrative draft
                  </div>
                  <p className="font-display text-lg font-medium leading-snug text-white sm:text-xl">
                    Sessions were 3,842 (+14.2%). Search clicks were 1,904 (+9.8%).
                  </p>
                  <p className="mt-2.5 text-xs sm:text-[13px] leading-relaxed text-slate-300">
                    Work logged this month includes landing-page refreshes and schema fixes.
                    Those items line up with the movement above. This is correlation, not a claim that the work caused it.
                    Query <span className="text-white font-mono bg-white/10 px-1 py-0.5 rounded text-[11px]">emergency plumber</span> is at position 3.2. Conversions are 47 (+6.8%).
                  </p>
                </div>

                {/* Metric pill row */}
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  <div className="rounded-[10px] border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Sessions</p>
                    <p className="font-display mt-1 text-xl font-bold text-white">
                      {counterValues.sessions.toLocaleString()}
                    </p>
                    <p className="mt-0.5 text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> +14.2%
                    </p>
                  </div>
                  <div className="rounded-[10px] border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Clicks</p>
                    <p className="font-display mt-1 text-xl font-bold text-white">
                      {counterValues.clicks.toLocaleString()}
                    </p>
                    <p className="mt-0.5 text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> +9.8%
                    </p>
                  </div>
                  <div className="rounded-[10px] border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Leads / Conv.</p>
                    <p className="font-display mt-1 text-xl font-bold text-white">
                      {counterValues.conv.toLocaleString()}
                    </p>
                    <p className="mt-0.5 text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> +6.8%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LIVE METRICS */}
            {activeTab === "metrics" && (
              <div className="space-y-4 pt-5 animate-fade-in">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Top Converting Organic Queries
                </p>
                <div className="space-y-2">
                  {[
                    { query: "emergency plumber near me", clicks: 684, pos: "2.8", pct: "72%" },
                    { query: "water heater repair cost", clicks: 421, pos: "3.4", pct: "54%" },
                    { query: "drain clearing service 24/7", clicks: 312, pos: "4.1", pct: "40%" },
                    { query: "commercial pipe repair", clicks: 198, pos: "5.0", pct: "28%" },
                  ].map((row) => (
                    <div key={row.query} className="rounded-[8px] bg-white/5 p-2.5 text-xs border border-white/5">
                      <div className="flex items-center justify-between text-slate-200">
                        <span className="font-mono text-[11px] truncate">{row.query}</span>
                        <span className="font-semibold">{row.clicks} clicks</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: row.pct, backgroundColor: selectedTheme.accent }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Pos {row.pos}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: WORK LOG */}
            {activeTab === "worklog" && (
              <div className="space-y-3 pt-5 animate-fade-in">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Logged Agency Work</span>
                  <span className="font-mono">14.5 Total Hours</span>
                </div>
                <div className="space-y-2">
                  {[
                    { title: "Landing page speed & schema overhaul", cat: "technical", hours: "4.5h" },
                    { title: "18 localized service page refreshes", cat: "content", hours: "6.0h" },
                    { title: "Local citation cleanup & high-intent backlinks", cat: "authority", hours: "4.0h" },
                  ].map((w) => (
                    <div key={w.title} className="flex items-start justify-between gap-3 rounded-[8px] bg-white/5 p-3 border border-white/5 text-xs">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-400 shrink-0" />
                        <div>
                          <p className="font-medium text-slate-200">{w.title}</p>
                          <span className="mt-1 inline-block rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono uppercase text-slate-300">
                            {w.cat}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-semibold text-slate-300">{w.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* White-Label Interactive Color Swapper */}
            <div className="mt-6 border-t border-white/10 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-medium text-slate-400">
                  Test your agency brand color:
                </p>
                <div className="flex items-center gap-1.5">
                  {BRAND_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      title={theme.label}
                      onClick={() => setSelectedTheme(theme)}
                      className={`h-5 w-5 rounded-full transition-transform ${
                        selectedTheme.id === theme.id
                          ? "ring-2 ring-white ring-offset-2 ring-offset-[#0d131f] scale-110"
                          : "opacity-70 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: theme.primary }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
