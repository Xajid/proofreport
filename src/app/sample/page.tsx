import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function SamplePage() {
  return (
    <div className="min-h-screen surface-mesh">
      <SiteHeader />
      <main className="mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">Sample</p>
        <h1 className="font-display mt-3 text-4xl font-semibold text-slate-950 sm:text-5xl">
          See the report your clients will receive
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-600">
          A watermarked monthly SEO report with cover, executive narrative, organic metrics,
          conversions, work log, next actions, and optional AI mentions.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <a href="/api/sample" target="_blank" rel="noreferrer">
            <Button size="lg">Open sample PDF</Button>
          </a>
          <Link href="/register">
            <Button size="lg" variant="outline">
              Create account
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
