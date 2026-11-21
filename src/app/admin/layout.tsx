import type { ReactNode } from "react";
import type { Metadata } from "next";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = { ...noIndex, title: "Admin" };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
