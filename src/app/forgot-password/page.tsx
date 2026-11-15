"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, FileText, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [devResetUrl, setDevResetUrl] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setDevResetUrl("");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Unable to request reset");
      return;
    }
    setMessage(data.message);
    if (data.devResetUrl) setDevResetUrl(data.devResetUrl);
  }

  return (
    <div className="flex min-h-screen items-center justify-center surface-mesh px-6 py-12">
      <div className="w-full max-w-[400px] animate-rise">
        <Link href="/login" className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-teal-700">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>

        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-teal-700">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-lg font-semibold text-slate-900">ProofReport</span>
        </div>

        <div className="panel p-6">
          <h1 className="text-xl font-semibold text-slate-900">Reset your password</h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter your work email and we&apos;ll prepare a password reset link.
          </p>

          {message ? (
            <div className="mt-5 space-y-3">
              <div className="toast-success rounded-[8px] px-4 py-3 text-sm">
                <div className="flex items-start gap-2.5">
                  <MailCheck className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{message}</span>
                </div>
              </div>
              {devResetUrl ? (
                <div className="rounded-[8px] border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900">
                  <p className="font-semibold">Local reset link:</p>
                  <Link href={devResetUrl} className="mt-1 block break-all font-mono underline">
                    {devResetUrl}
                  </Link>
                </div>
              ) : null}
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@agency.com"
                  required
                />
              </div>
              {error && (
                <p className="rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}
              <Button className="w-full" disabled={loading}>
                {loading ? "Preparing…" : "Send reset link"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

