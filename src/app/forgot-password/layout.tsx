import type { ReactNode } from "react";
import type { Metadata } from "next";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = { ...noIndex, title: "Forgot password" };

export default function ForgotPasswordLayout({ children }: { children: ReactNode }) {
  return children;
}
