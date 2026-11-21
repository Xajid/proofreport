import type { MetadataRoute } from "next";
import { PUBLIC_PAGES, SITE_URL } from "@/lib/site-content";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-11-21");
  return Object.values(PUBLIC_PAGES).map((page) => ({
    url: new URL(page.path, SITE_URL).href,
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
