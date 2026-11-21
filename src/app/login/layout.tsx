import type { ReactNode } from "react";
import type { Metadata } from "next";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = { ...noIndex, title: "Log in" };

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
