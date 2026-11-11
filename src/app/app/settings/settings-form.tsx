"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SettingsForm() {
  const search = useSearchParams();
  const [form, setForm] = useState({
    name: "",
    logoUrl: "",
    primaryColor: "#0F766E",
    scheduleDay: 1,
  });
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
            primaryColor: org.primaryColor || "#0F766E",
            scheduleDay: org.scheduleDay || 1,
          });
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
    setLoading(false);
    setMsg(res.ok ? "Branding saved" : "Save failed");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">Settings</p>
        <h1 className="font-display mt-1 text-3xl font-semibold text-slate-950">Agency branding</h1>
        <p className="mt-1 text-sm text-slate-600">
          These details appear on report covers and the client-facing PDF.
        </p>
      </div>

      {msg ? (
        <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
          {msg}
        </div>
      ) : null}

      <form onSubmit={save} className="panel space-y-5 p-6">
        <div className="space-y-2">
          <Label>Agency name</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Logo URL</Label>
          <Input
            value={form.logoUrl}
            onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
            placeholder="https://…"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
          <div className="space-y-2">
            <Label>Primary color</Label>
            <Input
              type="color"
              value={form.primaryColor}
              onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
              className="h-12 cursor-pointer p-1"
            />
          </div>
          <div className="space-y-2">
            <Label>Monthly generate day (1–28)</Label>
            <Input
              type="number"
              min={1}
              max={28}
              value={form.scheduleDay}
              onChange={(e) => setForm({ ...form, scheduleDay: Number(e.target.value) })}
            />
          </div>
        </div>
        <div
          className="rounded-lg px-4 py-4 text-white"
          style={{ background: `linear-gradient(135deg, ${form.primaryColor}, #0f172a)` }}
        >
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/70">Cover preview</p>
          <p className="mt-2 font-display text-xl font-semibold">{form.name || "Your agency"}</p>
          <p className="mt-1 text-sm text-white/75">Monthly SEO Report</p>
        </div>
        <Button disabled={loading}>{loading ? "Saving…" : "Save branding"}</Button>
      </form>

      <section className="panel p-5">
        <h2 className="text-sm font-semibold text-slate-900">Integrations</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li className="flex justify-between gap-3 border-b border-slate-100 py-2">
            <span>OpenAI narrative</span>
            <span className="font-mono text-xs text-slate-500">OPENAI_API_KEY</span>
          </li>
          <li className="flex justify-between gap-3 border-b border-slate-100 py-2">
            <span>Google GA4 / GSC</span>
            <span className="font-mono text-xs text-slate-500">GOOGLE_CLIENT_*</span>
          </li>
          <li className="flex justify-between gap-3 py-2">
            <span>Stripe checkout</span>
            <span className="font-mono text-xs text-slate-500">STRIPE_SECRET_KEY</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
