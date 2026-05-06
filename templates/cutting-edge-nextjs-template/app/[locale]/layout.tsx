import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { cookies } from "next/headers";
import {
  buildAbsoluteUrl,
  buildAlternates,
  LOCALE_TO_OG,
  OG_DEFAULT_IMAGE_PATH,
  SITE_DESCRIPTION,
  SITE_NAME,
  TWITTER_DEFAULT_IMAGE_PATH,
} from "@/config/seo";
import { routing } from "@/i18n/routing";
import { buildOrganizationSchema, buildWebsiteSchema } from "@/lib/seo/schema";
import { serverEnv } from "@/lib/env/server";
import ThemeProvider from "@/providers/theme-provider";
import "@/app/globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const baseUrl = serverEnv.NEXT_PUBLIC_BASE_URL;
  const ogLocale = LOCALE_TO_OG[locale as keyof typeof LOCALE_TO_OG] ?? "en_US";
  const alternateLocale = ogLocale === "vi_VN" ? "en_US" : "vi_VN";
  const alternates = buildAlternates("/");

  return {
    metadataBase: new URL(baseUrl),
    title: t("title"),
    description: t("description"),
    verification: {
      google: serverEnv.GOOGLE_SITE_VERIFICATION,
      other: serverEnv.BING_SITE_VERIFICATION
        ? { msvalidate: serverEnv.BING_SITE_VERIFICATION }
        : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates,
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: alternates.languages[locale] ?? alternates.languages.en,
      type: "website",
      locale: ogLocale,
      alternateLocale,
      images: [
        {
          url: buildAbsoluteUrl(OG_DEFAULT_IMAGE_PATH),
          width: 1200,
          height: 630,
          alt: t("title"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [buildAbsoluteUrl(TWITTER_DEFAULT_IMAGE_PATH)],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const jsonLd = [
    buildWebsiteSchema({
      url: serverEnv.NEXT_PUBLIC_BASE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
    }),
    buildOrganizationSchema({
      url: serverEnv.NEXT_PUBLIC_BASE_URL,
      name: SITE_NAME,
      logoUrl: buildAbsoluteUrl("/icon-512.png"),
    }),
  ];

  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("theme")?.value;
  const theme =
    themeCookie === "breakingbit" || themeCookie === "breakingbit-light"
      ? themeCookie
      : "breakingbit";

  return (
    <html lang={locale} data-theme={theme}>
      <body className="min-h-dvh tracking-wide antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Analytics />
        <NextIntlClientProvider>
          <ThemeProvider initialTheme={theme}>{children}</ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
