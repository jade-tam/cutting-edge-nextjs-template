import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export const revalidate = 300;

export default async function PublicLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-5xl flex-col justify-center gap-8 px-6 py-16">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">{t("pages.public.landing.title")}</h1>
        <p className="text-base-content/70">
          {t("pages.public.landing.description")}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/solutions" className="btn btn-primary">
          {t("navigation.solutions")}
        </Link>
        <Link href="/pricing" className="btn btn-secondary">
          {t("navigation.pricing")}
        </Link>
        <Link href="/contact" className="btn btn-success">
          {t("navigation.contact")}
        </Link>
        <Link href="/dashboard" className="btn btn-error">
          {t("navigation.dashboard")}
        </Link>
      </div>
    </main>
  );
}
