"use client";

import { useTranslations } from "next-intl";

import ThemeToggle from "@/components/theme/ThemeToggle";
import { DashboardPageShell } from "@/features/dashboard/components/dashboard-page-shell";

export default function DashboardSettingsPage() {
  const t = useTranslations();

  return (
    <DashboardPageShell
      title={t("pages.settings.title")}
      description={t("pages.settings.description")}
    >
      <div className="rounded-box w-full border border-base-300 bg-base-100 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">
              {t("pages.settings.appearance.title")}
            </h2>
            <p className="text-sm text-base-content/70">
              {t("pages.settings.appearance.description")}
            </p>
          </div>

          <ThemeToggle />
        </div>
      </div>
    </DashboardPageShell>
  );
}
