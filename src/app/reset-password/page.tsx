"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ResetPasswordInner() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Reset failed");
      return;
    }
    setDone(true);
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
          <h1 className="text-xl font-semibold text-slate-900">Choose a new password</h1>
          {!token ? (
            <p className="mt-3 text-sm text-red-700">Missing reset token. Request a new reset link.</p>
          ) : done ? (
            <div className="mt-4 space-y-4">
              <div className="toast-success flex items-center gap-2 rounded-[8px] px-4 py-3 text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Password updated. You can now sign in.
              </div>
              <Link href="/login" className="block">
                <Button className="w-full">Go to sign in</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">New password (min 8 chars)</Label>
                <Input
                  id="password"
                  type="password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input
                  id="confirm"
                  type="password"
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}
              <Button className="w-full" disabled={loading}>
                {loading ? "Updating…" : "Update password"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Loading…</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}

