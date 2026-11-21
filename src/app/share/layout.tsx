import type { ReactNode } from "react";
import type { Metadata } from "next";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = { ...noIndex, title: "Shared report" };

export default function ShareLayout({ children }: { children: ReactNode }) {
  return children;
}
