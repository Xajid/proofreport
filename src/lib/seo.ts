import type { Metadata } from "next";
import {
  AGENCY_MONTHLY_USD,
  ARTICLE_PUBLISHED,
  FAQS,
  PER_CLIENT_MONTHLY_USD,
  PUBLIC_PAGES,
  SITE_URL,
  type PublicPage,
} from "@/lib/site-content";

export const noIndex: Metadata = {
  robots: { index: false, follow: false },
};

export function pageMeta(page: PublicPage): Metadata {
  const title = page.absoluteTitle ? { absolute: page.absoluteTitle } : page.title;
  const fullTitle = page.absoluteTitle ?? `${page.title} · SearchProof`;
  return {
    title,
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      title: fullTitle,
      description: page.description,
      url: page.path,
      type: "website",
    },
    twitter: {
      title: fullTitle,
      description: page.description,
    },
  };
}

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SearchProof",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    description: PUBLIC_PAGES.home.description,
    offers: [
      {
        "@type": "Offer",
        name: "Per Client",
        price: String(PER_CLIENT_MONTHLY_USD),
        priceCurrency: "USD",
        url: `${SITE_URL}/pricing`,
        description: "One paid client slot, billed monthly.",
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: "Unlimited Agency",
        price: String(AGENCY_MONTHLY_USD),
        priceCurrency: "USD",
        url: `${SITE_URL}/pricing`,
        description: "Unlimited clients, billed monthly. Each draft is still reviewed before send.",
        availability: "https://schema.org/InStock",
      },
    ],
  };
}

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

export function articleJsonLd(page: PublicPage) {
  const url = new URL(page.path, SITE_URL).href;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.title,
    description: page.description,
    datePublished: ARTICLE_PUBLISHED,
    dateModified: ARTICLE_PUBLISHED,
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: "SearchProof", url: SITE_URL },
    publisher: { "@type": "Organization", name: "SearchProof", url: SITE_URL },
  };
}

export function breadcrumbJsonLd(page: PublicPage) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: page.crumb,
        item: new URL(page.path, SITE_URL).href,
      },
    ],
  };
}
