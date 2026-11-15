import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Download, ArrowRight, FileText } from "lucide-react";

export default function SamplePage() {
  return (
    <div className="min-h-screen surface-mesh">
      <SiteHeader />
      <main className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-200/60 bg-teal-50/80 px-3 py-1.5 text-xs font-semibold text-teal-800">
          <FileText className="h-3.5 w-3.5" />
          Sample report
        </div>
        <h1 className="font-display text-4xl font-semibold text-slate-950 sm:text-5xl">
          See the report your clients will receive
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-slate-500">
          A watermarked monthly SEO report with cover, executive narrative, organic metrics,
          conversions, work log, next actions, and optional AI mentions page.
        </p>

        {/* Report preview card */}
        <div className="report-canvas mt-12 w-full max-w-sm rounded-[18px] p-7 text-left sm:p-9">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-200/60">
            <span>Monthly SEO Report</span>
            <span>Oct 2026</span>
          </div>
          <p className="mt-6 font-display text-2xl font-semibold leading-snug text-white">
            Sessions +14.2%. Clicks +9.8%.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-2.5">
            {[["Sessions", "3,842"], ["Clicks", "1,904"], ["Conv.", "47"]].map(([label, value]) => (
              <div key={label} className="rounded-[10px] border border-white/10 bg-white/10 px-2.5 py-3 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-wide text-teal-200/60">{label}</p>
                <p className="mt-1 text-lg font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-white/10 pt-4 text-xs text-teal-200/50">
            SAMPLE · Watermarked · Bright Plumbing Co.
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a href="/api/sample" target="_blank" rel="noreferrer">
            <Button size="lg">
              <Download className="h-4 w-4" />
              Open sample PDF
            </Button>
          </a>
          <Link href="/register">
            <Button size="lg" variant="outline">
              Create account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
