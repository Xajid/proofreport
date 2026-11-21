import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-content";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app", "/admin", "/api", "/share", "/checkout"],
    },
    sitemap: new URL("/sitemap.xml", SITE_URL).href,
  };
}
