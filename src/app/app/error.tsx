"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="panel max-w-md p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="font-display text-xl font-semibold text-slate-900">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {error.message || "An unexpected error occurred while loading this page."}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button size="sm" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" />
            Try again
          </Button>
          <Link href="/app">
            <Button size="sm" variant="outline">
              Go to overview
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

