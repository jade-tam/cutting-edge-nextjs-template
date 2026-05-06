"use client";

import { useTranslations } from "next-intl";

import { DashboardPageBoundary } from "@/features/dashboard/components/dashboard-page-boundary";
import ExampleEntityForm from "@/features/example-entity/components/example-entity-form";
import { useExampleEntity } from "@/features/example-entity/hooks/use-example-entity";
import { getExampleEntityErrorTranslationKey } from "@/lib/toast/messages";

type ExampleEntityEditScreenProps = {
  id: string;
};

export default function ExampleEntityEditScreen({ id }: ExampleEntityEditScreenProps) {
  const t = useTranslations();
  const detailQuery = useExampleEntity(id);

  if (detailQuery.isPending) {
    return (
      <DashboardPageBoundary isPending loadingText={t("exampleEntity.detail.loading")}>
        <div />
      </DashboardPageBoundary>
    );
  }

  if (detailQuery.isError) {
    return (
      <div className="alert alert-error">
        {t(getExampleEntityErrorTranslationKey(detailQuery.error.message, "toast.exampleEntity.loadFailed"))}
      </div>
    );
  }

  if (!detailQuery.data) {
    return <div className="alert">{t("exampleEntity.detail.notFound")}</div>;
  }

  return (
    <ExampleEntityForm
      mode="edit"
      id={id}
      defaultValues={{
        title: detailQuery.data.title,
        body: detailQuery.data.body,
        slug: detailQuery.data.slug,
        summary: detailQuery.data.summary,
        status: detailQuery.data.status,
        category: detailQuery.data.category,
        tags: detailQuery.data.tags,
        priority: detailQuery.data.priority,
        ownerName: detailQuery.data.ownerName,
        dueDate: detailQuery.data.dueDate,
        isFeatured: detailQuery.data.isFeatured,
        publishedAt: detailQuery.data.publishedAt,
        estimatedHours: detailQuery.data.estimatedHours,
        progressPercent: detailQuery.data.progressPercent,
        attachmentsUrl: detailQuery.data.attachmentsUrl,
        externalLink: detailQuery.data.externalLink,
        notes: detailQuery.data.notes,
      }}
    />
  );
}
