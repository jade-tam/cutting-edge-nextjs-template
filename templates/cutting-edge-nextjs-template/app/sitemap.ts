import type { MetadataRoute } from "next";
import { buildAbsoluteUrl, getLocalizedPath } from "@/config/seo";
import { routing } from "@/i18n/routing";

const publicRoutes = ["/", "/pricing", "/solutions", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.flatMap((locale) =>
    publicRoutes.map((route) => ({
      url: buildAbsoluteUrl(getLocalizedPath(locale, route)),
      lastModified: new Date(),
      changeFrequency: route === "/" ? ("weekly" as const) : ("monthly" as const),
      priority: route === "/" ? 1 : 0.8,
    })),
  );
}
