"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export default function LoginPage() {
  const [email, setEmail] = useState(isDemo ? "demo@proofreport.app" : "");
  const [password, setPassword] = useState(isDemo ? "demo12345" : "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password. Please try again.");
      return;
    }
    window.location.href = "/app";
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ── Left panel ── */}
      <div className="relative hidden overflow-hidden lg:flex lg:flex-col">
        {/* Background */}
        <div className="absolute inset-0 bg-[#0d1117]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(13,110,104,0.40),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(3,105,161,0.15),transparent_60%)]" />
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        <div className="relative flex h-full flex-col justify-between p-10">
          {/* Logo */}
          <BrandLogo tone="light" size="lg" />

          {/* Value prop */}
          <div className="max-w-sm">
            <p className="font-display text-3xl font-semibold leading-snug text-white">
              The reporting layer agencies use to keep retainers.
            </p>
            <p className="mt-5 text-[15px] leading-relaxed text-slate-400">
              Metrics, work proof, narrative, and next actions — packaged as a branded monthly PDF.
            </p>

            {/* Testimonial card */}
            <div className="mt-10 rounded-[12px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <p className="text-sm leading-relaxed text-slate-300 italic">
                &ldquo;ProofReport cut our monthly report time from 3 hours to 20 minutes. Clients actually read these now.&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                  NS
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">Northline SEO</p>
                  <p className="text-xs text-slate-500">Demo workspace</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600">
            Trusted demo workspace · Northline SEO
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex items-center justify-center surface-mesh px-6 py-12">
        <div className="w-full max-w-[400px] animate-rise">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <BrandLogo size="md" href="/" />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Sign in to your agency workspace
            </p>
          </div>

          {/* Demo hint */}
          {isDemo && (
            <div className="mb-6 rounded-[9px] border border-sky-200/70 bg-sky-50 px-3.5 py-3 text-xs text-sky-800">
              <span className="font-semibold">Demo credentials pre-filled:</span>{" "}
              <span className="font-mono">demo@proofreport.app</span> / demo12345
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@agency.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-slate-500 hover:text-teal-700 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-[8px] border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button className="w-full" size="default" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-teal-700 hover:text-teal-900 hover:underline underline-offset-2">
              Create your agency
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
