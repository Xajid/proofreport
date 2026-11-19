"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { BrandLogo } from "./brand-logo";

export function SiteHeader() {
  const { status } = useSession();
  const signedIn = status === "authenticated";

  return (
    <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
      <BrandLogo href="/" />
      <nav className="flex items-center gap-0.5 text-sm font-medium text-slate-600">
        <Link
          href="/pricing"
          className="rounded-[8px] px-3 py-2 transition-colors hover:bg-white/80 hover:text-slate-900"
        >
          Pricing
        </Link>
        <Link
          href="/sample"
          className="rounded-[8px] px-3 py-2 transition-colors hover:bg-white/80 hover:text-slate-900"
        >
          Sample
        </Link>
        {signedIn ? (
          <Link href="/app" className="ml-2">
            <Button size="sm">Open workspace</Button>
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-[8px] px-3 py-2 transition-colors hover:bg-white/80 hover:text-slate-900"
            >
              Log in
            </Link>
            <Link href="/register" className="ml-2">
              <Button size="sm">Start free</Button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
