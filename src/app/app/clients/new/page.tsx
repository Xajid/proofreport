"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewClientPage() {
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
      setError(data.error || "Failed");
      return;
    }
    router.push(`/app/clients/${data.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link href="/app/clients" className="text-sm font-medium text-teal-800 hover:underline">
          ← Clients
        </Link>
        <h1 className="font-display mt-3 text-3xl font-semibold text-slate-950">New client</h1>
        <p className="mt-1 text-sm text-slate-600">Add a domain to your reporting portfolio.</p>
      </div>

      <form onSubmit={onSubmit} className="panel space-y-4 p-6">
        <div className="space-y-2">
          <Label>Client name</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Domain</Label>
          <Input
            placeholder="example.com"
            value={form.domain}
            onChange={(e) => setForm({ ...form, domain: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Contact email</Label>
          <Input
            type="email"
            value={form.contactEmail}
            onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
          />
        </div>
        <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={form.aiMentionsEnabled}
            onChange={(e) => setForm({ ...form, aiMentionsEnabled: e.target.checked })}
          />
          <span>
            <span className="font-semibold text-slate-900">Enable AI mentions page</span>
            <span className="mt-0.5 block text-slate-600">
              Optional last PDF page for AEO prompt results.
            </span>
          </span>
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <div className="flex gap-2 pt-2">
          <Button disabled={loading}>{loading ? "Saving…" : "Create client"}</Button>
          <Link href="/app/clients">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
