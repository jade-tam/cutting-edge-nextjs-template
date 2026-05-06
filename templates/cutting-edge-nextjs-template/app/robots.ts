import type { MetadataRoute } from "next";
import { getCanonicalBaseUrl } from "@/config/seo";

export default function robots(): MetadataRoute.Robots {
  const base = getCanonicalBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/*", "/api/*"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
