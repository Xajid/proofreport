"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/card";
import { Paintbrush, Calendar, Key, Zap, CreditCard } from "lucide-react";

type IntegrationStatus = {
  openai: boolean;
  google: boolean;
  stripe: boolean;
};

const INTEGRATIONS: {
  id: keyof IntegrationStatus;
  label: string;
  key: string;
  description: string;
  icon: typeof Zap;
  color: string;
}[] = [
  {
    id: "openai",
    label: "OpenAI narrative",
    key: "OPENAI_API_KEY",
    description: "AI-generated executive summaries",
    icon: Zap,
    color: "text-violet-600 bg-violet-50 border-violet-100",
  },
  {
    id: "google",
    label: "Google GA4 / GSC",
    key: "GOOGLE_CLIENT_*",
    description: "Auto-pull traffic and search metrics",
    icon: Key,
    color: "text-sky-600 bg-sky-50 border-sky-100",
  },
  {
    id: "stripe",
    label: "Stripe checkout",
    key: "STRIPE_SECRET_KEY",
    description: "Live billing and subscription management",
    icon: CreditCard,
    color: "text-emerald-600 bg-emerald-50 border-emerald-100",
  },
];

export function SettingsForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [form, setForm] = useState({
    name: "",
    logoUrl: "",
    primaryColor: "#0d6e68",
    scheduleDay: 1,
  });
  const [plan, setPlan] = useState("trial");
  const [status, setStatus] = useState<IntegrationStatus>({
    openai: false,
    google: false,
    stripe: false,
  });
  const [logoError, setLogoError] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/org")
      .then((r) => r.json())
      .then((org) => {
        if (org?.name) {
          setForm({
            name: org.name,
            logoUrl: org.logoUrl || "",
            primaryColor: org.primaryColor || "#0d6e68",
            scheduleDay: org.scheduleDay || 1,
          });
          setPlan(org.plan || "trial");
          if (org.integrationStatus) setStatus(org.integrationStatus);
        }
      });
    const checkout = search.get("checkout");
    if (checkout) {
      setMsg(
        checkout.startsWith("mock")
          ? `Mock checkout complete (${search.get("plan") || "plan"}). Add STRIPE_SECRET_KEY for live test mode.`
          : "Stripe checkout returned successfully."
      );
    }
  }, [search]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/org", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMsg(data.error || "Save failed — please check inputs");
      return;
    }
    setMsg("Branding saved successfully ✓");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-slate-600">
              <Paintbrush className="h-3 w-3" />
              Settings
            </span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 sm:text-3xl">Agency branding</h1>
          <p className="mt-1 text-sm text-slate-500">
            These details appear on report covers and the client-facing PDF.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={plan === "trial" ? "neutral" : "brand"} dot>
            Plan: {plan.replace("_", " ")}
          </Badge>
          <Link href="/pricing">
            <Button size="sm" variant="outline">Upgrade</Button>
          </Link>
        </div>
      </div>

      {msg && (
        <div
          className={`rounded-[9px] px-4 py-3 text-sm font-medium animate-scale-in ${
            msg.includes("✓") || msg.includes("successfully")
              ? "toast-success"
              : msg.includes("failed") || msg.includes("Invalid")
              ? "border border-red-200 bg-red-50 text-red-700"
              : "toast-info"
          }`}
        >
          {msg}
        </div>
      )}

      <div className="rounded-[var(--radius)] border border-slate-200/80 bg-white shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-slate-900">Report branding</h2>
          <p className="text-xs text-slate-500 mt-0.5">Customize how your reports look to clients.</p>
        </div>

        <form onSubmit={save}>
          <div className="divide-y divide-slate-100">
            <div className="px-6 py-5 space-y-1.5">
              <Label>Agency name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Northline SEO"
                required
              />
            </div>

            <div className="px-6 py-5 space-y-1.5">
              <Label>Logo URL <span className="text-slate-400 font-normal">(optional PNG or JPG)</span></Label>
              <Input
                value={form.logoUrl}
                onChange={(e) => {
                  setLogoError(false);
                  setForm({ ...form, logoUrl: e.target.value });
                }}
                placeholder="https://your-agency.com/logo.png"
              />
              <p className="text-xs text-slate-500">
                Public PNG/JPG URL used on report covers; falls back to initials if omitted.
              </p>
            </div>

            <div className="grid gap-5 px-6 py-5 sm:grid-cols-[180px_1fr]">
              <div className="space-y-1.5">
                <Label>Brand color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    className="h-10 w-10 shrink-0 cursor-pointer rounded-[7px] border border-slate-200 p-0.5 shadow-[var(--shadow-xs)]"
                  />
                  <Input
                    value={form.primaryColor}
                    onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    className="font-mono text-sm"
                    maxLength={7}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Monthly generate day
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={28}
                  value={form.scheduleDay}
                  onChange={(e) => setForm({ ...form, scheduleDay: Number(e.target.value) })}
                  className="w-24"
                />
                <p className="text-xs text-slate-500">Day of month for scheduled cron runs (1–28).</p>
              </div>
            </div>

            <div className="px-6 py-5">
              <Label className="mb-3 block">Cover preview</Label>
              <div
                className="relative overflow-hidden rounded-[12px] px-6 py-6 text-white"
                style={{ background: `linear-gradient(135deg, ${form.primaryColor}, #0d1117)` }}
              >
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />
                <div className="relative">
                  <div className="flex items-center gap-2.5">
                    {form.logoUrl && !logoError ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={form.logoUrl}
                        alt={form.name || "Agency logo"}
                        onError={() => setLogoError(true)}
                        className="h-7 w-7 rounded-[6px] bg-white object-contain p-0.5"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-white/20 text-xs font-bold">
                        {(form.name || "PR").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">
                      Monthly SEO Report
                    </p>
                  </div>
                  <p className="mt-3 font-display text-xl font-semibold">{form.name || "Your agency"}</p>
                  <p className="mt-1 text-sm text-white/70">Client Report · Sample Cover</p>
                  <div className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2.5 py-1 text-xs text-white/80 backdrop-blur-sm">
                    Prepared by {form.name || "Your agency"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-4 flex justify-end">
            <Button disabled={loading} size="sm">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving…
                </span>
              ) : (
                "Save branding"
              )}
            </Button>
          </div>
        </form>
      </div>

      <div className="rounded-[var(--radius)] border border-slate-200/80 bg-white shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-slate-900">Integrations</h2>
          <p className="text-xs text-slate-500 mt-0.5">Live environment status on this server.</p>
        </div>
        <ul className="divide-y divide-slate-100">
          {INTEGRATIONS.map((item) => {
            const Icon = item.icon;
            const active = status[item.id];
            return (
              <li key={item.key} className="flex items-center gap-4 px-5 py-4">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border ${item.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                    <Badge tone={active ? "success" : "neutral"} dot>
                      {active ? "Configured" : "Demo mode"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
                <code className="hidden sm:inline-flex shrink-0 rounded-md bg-slate-100 border border-slate-200 px-2 py-1 font-mono text-[11px] text-slate-600">
                  {item.key}
                </code>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
