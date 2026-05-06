import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export default async function UnauthorizedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<JSX.Element> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.unauthorized");

  return (
    <section className="mx-auto max-w-xl px-2 py-16 sm:px-0">
      <div className="card bg-base-100 card-border border-base-300 card-sm overflow-hidden text-center">
        <div className="card-body items-center gap-4">
          <span
            className="icon-[fluent--shield-warning-24-regular] size-8 opacity-50"
            aria-hidden="true"
          />
          <h1 className="text-3xl font-semibold">{t("title")}</h1>
          <h2 className="text-xl text-base-content/80">{t("heading")}</h2>
          <p className="text-base-content/70">{t("description")}</p>
          <div>
            <Link className="btn btn-primary" href="/">
              {t("backToHome")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
