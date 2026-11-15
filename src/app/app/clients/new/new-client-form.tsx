"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function NewClientForm({
  canUseAiMentions = true,
}: {
  canUseAiMentions?: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    domain: "",
    contactEmail: "",
    aiMentionsEnabled: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to create client");
      return;
    }
    router.push(`/app/clients/${data.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 animate-fade-in">
      <div>
        <Link
          href="/app/clients"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-teal-700 transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Clients
        </Link>
        <h1 className="font-display text-2xl font-semibold text-slate-900 sm:text-3xl">New client</h1>
        <p className="mt-1 text-sm text-slate-500">Add a domain to your reporting portfolio.</p>
      </div>

      <div className="rounded-[var(--radius)] border border-slate-200/80 bg-white shadow-[var(--shadow-sm)] overflow-hidden">
        <form onSubmit={onSubmit}>
          <div className="divide-y divide-slate-100">
            {/* Client name */}
            <div className="px-6 py-5 space-y-1.5">
              <Label htmlFor="name">Client name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Bright Plumbing Co."
                required
              />
            </div>

            {/* Domain */}
            <div className="px-6 py-5 space-y-1.5">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                value={form.domain}
                onChange={(e) => setForm({ ...form, domain: e.target.value })}
                placeholder="brightplumbing.com"
                required
              />
              <p className="text-xs text-slate-500">The root domain — no https:// needed.</p>
            </div>

            {/* Contact email */}
            <div className="px-6 py-5 space-y-1.5">
              <Label htmlFor="contactEmail">Contact email <span className="text-slate-400 font-normal">(optional)</span></Label>
              <Input
                id="contactEmail"
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                placeholder="owner@brightplumbing.com"
              />
            </div>

            {/* AI mentions toggle */}
            <div className="px-6 py-5">
              {!canUseAiMentions ? (
                <div className="flex items-start gap-4 rounded-[10px] border border-amber-200/80 bg-amber-50/50 px-4 py-4">
                  <div className="h-5 w-9 rounded-full border border-slate-300 bg-slate-200 mt-0.5 opacity-60" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">AI mentions page</span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 border border-amber-200 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                        Upgrade required
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Tracking ChatGPT, Perplexity, and Gemini citations requires a Per-Client or Agency plan.
                    </p>
                  </div>
                </div>
              ) : (
                <label className="flex cursor-pointer items-start gap-4 rounded-[10px] border border-slate-200 bg-slate-50/60 px-4 py-4 transition-colors hover:bg-slate-50 hover:border-teal-200/60">
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={form.aiMentionsEnabled}
                      onChange={(e) => setForm({ ...form, aiMentionsEnabled: e.target.checked })}
                    />
                    <div className="h-5 w-9 rounded-full border border-slate-300 bg-white transition-colors peer-checked:border-teal-500 peer-checked:bg-teal-500" />
                    <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-slate-400 shadow-sm transition-all peer-checked:left-4 peer-checked:bg-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">Enable AI mentions page</span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 border border-teal-100 px-1.5 py-0.5 text-[10px] font-semibold text-teal-700">
                        <Sparkles className="h-2.5 w-2.5" />
                        AEO
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500">
                      Optional last PDF page for AEO prompt results — shows if the client is mentioned by ChatGPT, Gemini, etc.
                    </p>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
            {error && (
              <p className="flex-1 text-sm text-red-600">{error}</p>
            )}
            <div className="ml-auto flex gap-2">
              <Link href="/app/clients">
                <Button type="button" variant="ghost" size="sm">Cancel</Button>
              </Link>
              <Button disabled={loading} size="sm">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving…
                  </span>
                ) : (
                  "Create client"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
