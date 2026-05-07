"use client";

import { useTranslations } from "next-intl";

import { DashboardPageShell } from "@/features/dashboard/components/dashboard-page-shell";
import ExampleEntityForm from "@/features/example-entity/components/example-entity-form";

export default function NewExampleEntityPage() {
  const t = useTranslations();

  return (
    <DashboardPageShell
      title={t("pages.exampleEntitiesCreate.title")}
      description={t("pages.exampleEntitiesCreate.description")}
    >
      <section className="mx-auto w-full max-w-7xl">
        <ExampleEntityForm mode="create" />
      </section>
    </DashboardPageShell>
  );
}
