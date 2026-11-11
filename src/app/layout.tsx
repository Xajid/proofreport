import type { Metadata } from "next";
import { Figtree, Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "ProofReport — Enterprise client reporting for SEO agencies",
  description:
    "White-label monthly SEO reports with work-log proof, GA4 + GSC metrics, AI narrative, and branded PDFs.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${figtree.variable} ${sora.variable} ${jetbrains.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
