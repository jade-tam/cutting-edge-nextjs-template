"use client";

import { use } from "react";
import { useTranslations } from "next-intl";

import { DashboardPageShell } from "@/features/dashboard/components/dashboard-page-shell";
import ExampleEntityEditScreen from "@/features/example-entity/components/example-entity-edit-screen";

export default function EditExampleEntityPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const t = useTranslations();
  const { id } = use(params);

  return (
    <DashboardPageShell
      title={t("pages.exampleEntitiesEdit.title")}
      description={t("pages.exampleEntitiesEdit.description")}
    >
      <section className="mx-auto w-full max-w-7xl">
        <ExampleEntityEditScreen id={id} />
      </section>
    </DashboardPageShell>
  );
}
