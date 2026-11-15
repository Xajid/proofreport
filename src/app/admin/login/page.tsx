"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
import { ShieldCheck, ArrowRight, Eye, EyeOff, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export default function AdminLoginPage() {
  const [email, setEmail] = useState(isDemo ? "demo@proofreport.app" : "");
  const [password, setPassword] = useState(isDemo ? "demo12345" : "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (res?.error || !res?.ok) {
        setLoading(false);
        setError("Invalid administrator credentials.");
        return;
      }

      // Verify super-admin status
      const checkRes = await fetch("/api/admin/check");
      const checkData = await checkRes.json();

      if (!checkData.isAdmin) {
        await signOut({ redirect: false });
        setLoading(false);
        setError(
          `Access Denied: ${email} is not authorized for super-admin access. Agency accounts must log in through the agency portal.`
        );
        return;
      }

      window.location.href = "/admin";
    } catch {
      setLoading(false);
      setError("An unexpected authentication error occurred.");
    }
  }

  return (
    <div className="min-h-screen bg-[#070a10] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow and subtle grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.12),transparent_60%)]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative w-full max-w-md space-y-6">
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-[12px] bg-gradient-to-br from-amber-500 to-amber-700 shadow-[0_0_24px_rgba(245,158,11,0.35)] text-slate-950 mx-auto">
            <ShieldCheck className="h-6 w-6 text-slate-950" />
          </div>
          <div className="pt-2">
            <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300 uppercase tracking-widest">
              Restricted Access
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight pt-1">
            Super-Admin Portal
          </h1>
          <p className="text-xs text-slate-400">
            Sign in with your platform administrator credentials.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-[18px] border border-white/10 bg-[#0e1422]/90 p-7 shadow-2xl backdrop-blur-xl">
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="rounded-[10px] border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 flex items-start gap-2 leading-relaxed">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="admin-email" className="text-xs font-semibold text-slate-300">
                Administrator Email
              </Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@proofreport.app"
                required
                className="h-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-password" className="text-xs font-semibold text-slate-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="h-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold border-0 shadow-[0_4px_16px_rgba(245,158,11,0.25)] transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                  Verifying privileges…
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  Authenticate Admin
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </span>
              )}
            </Button>
          </form>

          {isDemo && (
            <div className="mt-5 pt-4 border-t border-white/5 text-center">
              <p className="text-[11px] text-slate-500">
                Demo admin credentials pre-filled: <span className="text-amber-400/90 font-mono">demo@proofreport.app</span>
              </p>
            </div>
          )}
        </div>

        {/* Links to switch to agency login or public landing */}
        <div className="text-center space-y-2 text-xs">
          <p className="text-slate-400">
            Agency customer?{" "}
            <Link href="/login" className="font-semibold text-amber-400 hover:underline">
              Go to Agency Login →
            </Link>
          </p>
          <p>
            <Link href="/" className="text-slate-500 hover:text-slate-300">
              ← Return to ProofReport homepage
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

