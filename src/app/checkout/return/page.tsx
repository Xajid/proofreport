"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function workspaceUrl(search: URLSearchParams) {
  const next = new URLSearchParams();
  next.set("checkout", search.get("checkout") || "success");
  const plan = search.get("plan");
  if (plan) next.set("plan", plan);
  return `/app/settings?${next.toString()}`;
}

function CheckoutReturn() {
  const search = useSearchParams();
  const destination = workspaceUrl(search);

  useEffect(() => {
    window.location.replace(destination);
  }, [destination]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium text-slate-900">Payment received. Opening your workspace.</p>
      <a href={destination} className="mt-4 text-sm font-semibold text-teal-800 underline">
        Continue
      </a>
    </main>
  );
}

export default function CheckoutReturnPage() {
  return (
    <Suspense>
      <CheckoutReturn />
    </Suspense>
  );
}
