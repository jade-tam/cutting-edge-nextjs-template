"use client";

import { useLocale, useTranslations } from "next-intl";

import { DashboardPageShell } from "@/features/dashboard/components/dashboard-page-shell";

export default function DashboardPage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <DashboardPageShell
      title={t("pages.dashboard.title")}
      description={t("pages.dashboard.description", { locale })}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <article className="card bg-base-100 p-4 shadow">
          <h2 className="text-lg font-semibold">{t("pages.dashboard.cards.overview.title")}</h2>
          <p className="text-sm text-base-content/70">
            {t("pages.dashboard.cards.overview.description")}
          </p>
        </article>
        <article className="card bg-base-100 p-4 shadow">
          <h2 className="text-lg font-semibold">{t("pages.dashboard.cards.exampleEntities.title")}</h2>
          <p className="text-sm text-base-content/70">
            {t("pages.dashboard.cards.exampleEntities.description")}
          </p>
        </article>
        <article className="card bg-base-100 p-4 shadow">
          <h2 className="text-lg font-semibold">{t("pages.dashboard.cards.providerSwitch.title")}</h2>
          <p className="text-sm text-base-content/70">
            {t("pages.dashboard.cards.providerSwitch.description")}
          </p>
        </article>
      </div>
    </DashboardPageShell>
  );
}
