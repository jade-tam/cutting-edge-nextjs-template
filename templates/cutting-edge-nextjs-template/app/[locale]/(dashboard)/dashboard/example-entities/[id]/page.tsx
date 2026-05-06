"use client";

import { use } from "react";
import { useTranslations } from "next-intl";

import { DashboardPageShell } from "@/features/dashboard/components/dashboard-page-shell";
import ExampleEntityDetail from "@/features/example-entity/components/example-entity-detail";

export default function ExampleEntityDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const t = useTranslations();
  const { id } = use(params);

  return (
    <DashboardPageShell
      title={t("pages.exampleEntitiesDetail.title")}
      description={t("pages.exampleEntitiesDetail.description")}
    >
      <section className="mx-auto max-w-4xl space-y-4">
        <ExampleEntityDetail id={id} />
      </section>
    </DashboardPageShell>
  );
}
