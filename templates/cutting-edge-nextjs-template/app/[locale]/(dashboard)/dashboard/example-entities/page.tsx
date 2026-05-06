"use client";

import { useTranslations } from "next-intl";

import { DashboardPageShell } from "@/features/dashboard/components/dashboard-page-shell";
import ExampleEntitiesTable from "@/features/example-entity/components/example-entities-table";

export default function ExampleEntitiesPage() {
  const t = useTranslations();

  return (
    <DashboardPageShell
      title={t("pages.exampleEntities.title")}
      description={t("pages.exampleEntities.description")}
    >
      <div className="min-h-0 flex-1">
        <ExampleEntitiesTable />
      </div>
    </DashboardPageShell>
  );
}
