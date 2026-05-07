import { routing } from "@/i18n/routing";
import { serverEnv } from "@/lib/env/server";

export const SITE_NAME = "Next.js Boilerplate Template";
export const SITE_DESCRIPTION = "Localized Next.js starter template";

export const OG_DEFAULT_IMAGE_PATH = "/og-default-1200x630.png";
export const TWITTER_DEFAULT_IMAGE_PATH = "/twitter-default-1200x630.png";

export const LOCALE_TO_OG = {
  en: "en_US",
  vi: "vi_VN",
} as const;

export function getCanonicalBaseUrl() {
  return serverEnv.NEXT_PUBLIC_BASE_URL;
}

export function getLocalizedPath(locale: string, path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (locale === routing.defaultLocale) return normalizedPath;
  return `/${locale}${normalizedPath === "/" ? "" : normalizedPath}`;
}

export function buildAbsoluteUrl(path = "/") {
  const base = getCanonicalBaseUrl();
  return new URL(path, base).toString();
}

export function buildAlternates(path = "/") {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, buildAbsoluteUrl(getLocalizedPath(locale, path))]),
  ) as Record<string, string>;

  return {
    canonical: buildAbsoluteUrl(getLocalizedPath(routing.defaultLocale, path)),
    languages: {
      ...languages,
      "x-default": buildAbsoluteUrl(getLocalizedPath(routing.defaultLocale, path)),
    } as Record<string, string>,
  };
}
