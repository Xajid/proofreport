import type { ReactNode } from "react";
import type { Metadata } from "next";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = { ...noIndex, title: "Checkout" };

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return children;
}
