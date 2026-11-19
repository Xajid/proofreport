"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("SearchProof Application Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center surface-mesh px-6 py-12">
      <div className="mb-8">
        <BrandLogo size="lg" href="/" />
      </div>

      <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-slate-200/80 bg-white p-8 text-center shadow-[var(--shadow-md)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-500/20">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Application Error</p>
        <h1 className="font-display mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm text-slate-500 leading-relaxed">
          {error.message || "An unexpected error occurred. Please try again or return to the homepage."}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Button size="sm" onClick={reset} className="w-full sm:w-auto">
            <RotateCcw className="h-4 w-4" />
            Try again
          </Button>
          <Link href="/" className="w-full sm:w-auto">
            <Button size="sm" variant="outline" className="w-full">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>
      </div>

      <p className="mt-8 text-xs text-slate-400">
        SearchProof · Monthly SEO reports for freelancers
      </p>
    </div>
  );
}
