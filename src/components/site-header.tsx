import Link from "next/link";
import { Button } from "./ui/button";

export function SiteHeader() {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
      <Link href="/" className="font-display text-[1.35rem] font-semibold text-slate-950">
        ProofReport
      </Link>
      <nav className="flex items-center gap-1 text-sm font-medium text-slate-600">
        <Link href="/pricing" className="rounded-md px-3 py-2 transition hover:bg-white/70 hover:text-slate-900">
          Pricing
        </Link>
        <Link href="/sample" className="rounded-md px-3 py-2 transition hover:bg-white/70 hover:text-slate-900">
          Sample
        </Link>
        <Link href="/login" className="rounded-md px-3 py-2 transition hover:bg-white/70 hover:text-slate-900">
          Log in
        </Link>
        <Link href="/register" className="ml-1">
          <Button size="sm">Start free</Button>
        </Link>
      </nav>
    </header>
  );
}
