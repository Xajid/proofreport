"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      <div className="relative hidden overflow-hidden bg-slate-950 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(15,118,110,0.35),transparent_55%)]" />
        <div className="relative flex h-full flex-col justify-between p-10 text-slate-100">
          <Link href="/" className="font-display text-xl font-semibold">
            ProofReport
          </Link>
          <div>
            <p className="font-display text-3xl font-semibold leading-snug">
              Stand up your agency workspace in under a minute.
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
              Branding, clients, connectors, and report generation — ready for your first retainer
              send.
            </p>
          </div>
          <p className="text-xs text-slate-400">No credit card required for the demo workspace</p>
        </div>
      </div>

      <div className="flex items-center justify-center surface-mesh px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold text-slate-950">Create your agency</h1>
          <p className="mt-1 text-sm text-slate-500">Start sending proof-of-work reports this week.</p>
          <form onSubmit={onSubmit} className="panel mt-8 space-y-4 p-6">
            {(
              [
                ["name", "Your name", "text"],
                ["agencyName", "Agency name", "text"],
                ["email", "Work email", "email"],
                ["password", "Password (min 8)", "password"],
              ] as const
            ).map(([key, label, type]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  required
                />
              </div>
            ))}
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            <Button className="w-full" disabled={loading}>
              {loading ? "Creating…" : "Create account"}
            </Button>
          </form>
          <p className="mt-5 text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-teal-800 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
