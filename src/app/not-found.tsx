import Link from "next/link";
import { FileSearch, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center surface-mesh px-6 py-12">
      <div className="mb-8">
        <BrandLogo size="lg" href="/" />
      </div>

      <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-slate-200/80 bg-white p-8 text-center shadow-[var(--shadow-md)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-600/20">
          <FileSearch className="h-7 w-7" />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">404 Error</p>
        <h1 className="font-display mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-slate-500 leading-relaxed">
          The page you requested doesn’t exist, has been moved, or the link has expired.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Link href="/" className="w-full sm:w-auto">
            <Button size="sm" className="w-full">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Link href="/pricing" className="w-full sm:w-auto">
            <Button size="sm" variant="outline" className="w-full">
              View Plans
            </Button>
          </Link>
        </div>
      </div>

      <p className="mt-8 text-xs text-slate-400">
        SearchProof · Enterprise Client Reporting for SEO & AEO Agencies
      </p>
    </div>
  );
}
