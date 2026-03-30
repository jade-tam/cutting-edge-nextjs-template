import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { routing } from "@/i18n/routing";
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://example.com";

  return {
    metadataBase: new URL(baseUrl),
    title: t("title"),
    description: t("description"),
    verification: {
      google: "REPLACE_WITH_GOOGLE_SITE_VERIFICATION",
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: locale === "en" ? baseUrl : `${baseUrl}/vi`,
      languages: {
        en: baseUrl,
        vi: `${baseUrl}/vi`,
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      locale: locale === "vi" ? "vi_VN" : "en_US",
      alternateLocale: locale === "vi" ? "en_US" : "vi_VN",
      images: [
        {
          url: "/logo.png",
          width: 1200,
          height: 630,
          alt: t("title"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: ["/logo.png"],
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Next.js Boilerplate Template",
    url: process.env.NEXT_PUBLIC_BASE_URL ?? "https://example.com",
    description: "Localized Next.js starter template",
  };

  return (
    <html lang={locale} data-theme="template">
      <body className="tracking-wide antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Analytics />
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
