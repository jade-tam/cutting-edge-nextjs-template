import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://example.com";
  const routes = [
    "/",
    "/about",
    "/blog",
    "/dashboard",
    "/dashboard/users",
    "/dashboard/users/create",
  ];

  return routing.locales.flatMap((locale) =>
    routes.map((route) => ({
      url:
        locale === routing.defaultLocale
          ? `${base}${route}`
          : `${base}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: route === "/" ? 1 : 0.8,
    }))
  );
}
