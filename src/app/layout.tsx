import type { Metadata } from "next";
import { Figtree, Sora, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { PUBLIC_PAGES, SITE_URL } from "@/lib/site-content";
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: PUBLIC_PAGES.home.absoluteTitle,
    template: "%s · SearchProof",
  },
  description: PUBLIC_PAGES.home.description,
  applicationName: "SearchProof",
  openGraph: {
    type: "website",
    siteName: "SearchProof",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${figtree.variable} ${sora.variable} ${jetbrains.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
