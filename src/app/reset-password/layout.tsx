import type { ReactNode } from "react";
import type { Metadata } from "next";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = { ...noIndex, title: "Reset password" };

export default function ResetPasswordLayout({ children }: { children: ReactNode }) {
  return children;
}
