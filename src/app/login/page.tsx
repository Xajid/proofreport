"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@proofreport.app");
  const [password, setPassword] = useState("demo12345");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    window.location.href = "/app";
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-slate-950 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(15,118,110,0.35),transparent_55%)]" />
        <div className="relative flex h-full flex-col justify-between p-10 text-slate-100">
          <Link href="/" className="font-display text-xl font-semibold">
            ProofReport
          </Link>
          <div>
            <p className="font-display text-3xl font-semibold leading-snug">
              The reporting layer agencies use to keep retainers.
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
              Metrics, work proof, narrative, and next actions — packaged as a branded monthly PDF.
            </p>
          </div>
          <p className="text-xs text-slate-400">Trusted demo workspace · Northline SEO</p>
        </div>
      </div>

      <div className="flex items-center justify-center surface-mesh px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="font-display text-xl font-semibold text-slate-950 lg:hidden">
            ProofReport
          </Link>
          <h1 className="mt-6 text-2xl font-semibold text-slate-950">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">
            Demo: <span className="font-mono text-slate-700">demo@proofreport.app</span> / demo12345
          </p>
          <form onSubmit={onSubmit} className="panel mt-8 space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            <Button className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-5 text-sm text-slate-600">
            No account?{" "}
            <Link href="/register" className="font-semibold text-teal-800 hover:underline">
              Create your agency
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
