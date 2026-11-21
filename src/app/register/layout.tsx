import type { ReactNode } from "react";
import type { Metadata } from "next";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = { ...noIndex, title: "Create an account" };

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return children;
}
