"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

const FEATURES = [
  "Agency logo, color, and cover branding",
  "Editable executive narrative before send",
  "GA4 + Search Console auto-pull",
  "AI mentions page for AEO visibility",
];

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    agencyName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      setError(data.error || "Registration failed");
      return;
    }
    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    window.location.href = "/app";
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ── Left panel ── */}
      <div className="relative hidden overflow-hidden lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[#0d1117]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(13,110,104,0.38),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(3,105,161,0.12),transparent_60%)]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        <div className="relative flex h-full flex-col justify-between p-10">
          <BrandLogo tone="light" size="lg" />

          <div className="max-w-sm">
            <p className="font-display text-3xl font-semibold leading-snug text-white">
              Stand up your agency workspace in under a minute.
            </p>
            <p className="mt-5 text-[15px] leading-relaxed text-slate-400">
              Branding, clients, connectors, and report generation — ready for your first retainer send.
            </p>

            <ul className="mt-10 space-y-3">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-slate-600">No credit card required for the demo workspace</p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex items-center justify-center surface-mesh px-6 py-12">
        <div className="w-full max-w-[400px] animate-rise">
          <div className="mb-8 lg:hidden">
            <BrandLogo size="md" href="/" />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-slate-900">Create your agency</h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Start sending proof-of-work reports this week.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {(
              [
                ["name", "Your name", "text", "Alex Johnson"],
                ["agencyName", "Agency name", "text", "Northline SEO"],
                ["email", "Work email", "email", "alex@agency.com"],
                ["password", "Password (min 8 chars)", "password", ""],
              ] as const
            ).map(([key, label, type, placeholder]) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  required
                />
              </div>
            ))}

            {error && (
              <div className="rounded-[8px] border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>

            <p className="text-center text-xs text-slate-500">
              By creating an account you agree to our Terms of Service.
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-teal-700 hover:text-teal-900 hover:underline underline-offset-2">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
