"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { showErrorToast, showSuccessToast } from "@/lib/toast/toast";

import { ConfirmationModal } from "@/components/confirmation-modal";
import { formatEntityDate } from "@/components/data-table/utils";
import { DashboardPageBoundary } from "@/features/dashboard/components/dashboard-page-boundary";
import {
  badgeClass,
  getOwnerBadgeClass,
  getPriorityBadgeClass,
  getStatusBadgeClass,
} from "@/features/example-entity/components/example-entities-table";
import { useDeleteExampleEntity } from "@/features/example-entity/hooks/use-delete-example-entity";
import { useExampleEntity } from "@/features/example-entity/hooks/use-example-entity";
import { Link, useRouter } from "@/i18n/navigation";
import { getExampleEntityErrorTranslationKey } from "@/lib/toast/messages";

type ExampleEntityDetailProps = {
  id: string;
};

export default function ExampleEntityDetail({ id }: ExampleEntityDetailProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const detailQuery = useExampleEntity(id);
  const deleteMutation = useDeleteExampleEntity();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  const entity = detailQuery.data;

  return (
    <>
      <article className="rounded-box border border-base-300 bg-base-100 shadow-sm">
        <div className="flex flex-col gap-4 p-4 md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">{entity.title}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className={badgeClass(getStatusBadgeClass(entity.status))}>
                  {t(`exampleEntity.form.fields.status.options.${entity.status}`)}
                </span>
                <span className={badgeClass(getPriorityBadgeClass(entity.priority))}>
                  {t(`exampleEntity.form.fields.priority.options.${entity.priority}`)}
                </span>
                <span className="badge badge-xs badge-outline whitespace-nowrap">
                  {t(`exampleEntity.form.fields.category.options.${entity.category}`)}
                </span>
                {entity.isFeatured ? (
                  <span className="badge badge-xs badge-accent whitespace-nowrap">
                    {t("exampleEntity.detail.featured")}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/dashboard/example-entities" className="btn btn-sm btn-ghost">
                <span className="icon-[fluent--arrow-left-24-regular] size-4" aria-hidden="true" />
                {t("exampleEntity.detail.actions.back")}
              </Link>
              <Link href={`/dashboard/example-entities/${entity.id}/edit`} className="btn btn-sm btn-soft btn-warning">
                <span className="icon-[fluent--edit-24-regular] size-4" aria-hidden="true" />
                {t("exampleEntity.detail.actions.edit")}
              </Link>
              <button
                type="button"
                className="btn btn-sm btn-soft btn-error"
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={deleteMutation.isPending}
              >
                <span className="icon-[fluent--delete-24-regular] size-4" aria-hidden="true" />
                {deleteMutation.isPending
                  ? t("exampleEntity.detail.actions.deleting")
                  : t("exampleEntity.detail.actions.delete")}
              </button>
            </div>
          </div>

          <p className="text-sm text-base-content/80">{entity.summary}</p>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-box bg-base-200/50 p-3">
              <p className="text-xs text-base-content/60">{t("exampleEntity.detail.owner")}</p>
              <span className={badgeClass(getOwnerBadgeClass())}>{entity.ownerName}</span>
            </div>
            <div className="rounded-box bg-base-200/50 p-3">
              <p className="text-xs text-base-content/60">{t("exampleEntity.detail.slug")}</p>
              <p className="font-medium">{entity.slug}</p>
            </div>
            <div className="rounded-box bg-base-200/50 p-3">
              <p className="text-xs text-base-content/60">{t("exampleEntity.detail.progressPercent")}</p>
              <p className="font-medium">{entity.progressPercent}%</p>
            </div>
            <div className="rounded-box bg-base-200/50 p-3">
              <p className="text-xs text-base-content/60">{t("exampleEntity.detail.estimatedHours")}</p>
              <p className="font-medium">{entity.estimatedHours ?? t("exampleEntity.detail.emptyValue")}</p>
            </div>
            <div className="rounded-box bg-base-200/50 p-3">
              <p className="text-xs text-base-content/60">{t("exampleEntity.detail.createdAt")}</p>
              <p className="font-medium">{formatEntityDate(entity.createdAt, locale)}</p>
            </div>
            <div className="rounded-box bg-base-200/50 p-3">
              <p className="text-xs text-base-content/60">{t("exampleEntity.detail.updatedAtLabel")}</p>
              <p className="font-medium">{formatEntityDate(entity.updatedAt, locale)}</p>
            </div>
            <div className="rounded-box bg-base-200/50 p-3">
              <p className="text-xs text-base-content/60">{t("exampleEntity.detail.dueDate")}</p>
              <p className="font-medium">{formatEntityDate(entity.dueDate, locale)}</p>
            </div>
            <div className="rounded-box bg-base-200/50 p-3">
              <p className="text-xs text-base-content/60">{t("exampleEntity.detail.publishedAt")}</p>
              <p className="font-medium">{formatEntityDate(entity.publishedAt, locale)}</p>
            </div>
          </div>

          <div className="rounded-box bg-base-200/40 p-3">
            <p className="mb-2 text-xs text-base-content/60">{t("exampleEntity.detail.tags")}</p>
            {entity.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {entity.tags.map((tag) => (
                  <span key={tag} className="badge badge-outline badge-sm">
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-base-content/60">{t("exampleEntity.detail.noTags")}</p>
            )}
          </div>

          <div className="rounded-box bg-base-200/40 p-3">
            <p className="mb-2 text-xs text-base-content/60">{t("exampleEntity.detail.bodyLabel")}</p>
            <p className="whitespace-pre-wrap text-sm">{entity.body}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-box bg-base-200/40 p-3">
              <p className="mb-2 text-xs text-base-content/60">{t("exampleEntity.detail.notes")}</p>
              <p className="whitespace-pre-wrap text-sm text-base-content/80">
                {entity.notes || t("exampleEntity.detail.noNotes")}
              </p>
            </div>
            <div className="rounded-box bg-base-200/40 p-3">
              <p className="mb-2 text-xs text-base-content/60">{t("exampleEntity.detail.externalLink")}</p>
              {entity.externalLink ? (
                <a href={entity.externalLink} target="_blank" rel="noreferrer" className="link link-primary break-all text-sm">
                  {entity.externalLink}
                </a>
              ) : (
                <p className="text-sm text-base-content/60">{t("exampleEntity.detail.noExternalLink")}</p>
              )}
            </div>
          </div>

          <div className="rounded-box bg-base-200/40 p-3">
            <p className="mb-2 text-xs text-base-content/60">{t("exampleEntity.detail.attachments")}</p>
            {entity.attachmentsUrl.length > 0 ? (
              <ul className="space-y-1">
                {entity.attachmentsUrl.map((url) => (
                  <li key={url}>
                    <a href={url} target="_blank" rel="noreferrer" className="link link-primary break-all text-sm">
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-base-content/60">{t("exampleEntity.detail.noAttachments")}</p>
            )}
          </div>
        </div>
      </article>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title={t("exampleEntity.detail.deleteModal.title")}
        message={t("exampleEntity.detail.deleteModal.description", {
          title: entity.title,
        })}
        confirmLabel={
          deleteMutation.isPending
            ? t("exampleEntity.detail.deleteModal.deleting")
            : t("exampleEntity.detail.deleteModal.confirm")
        }
        cancelLabel={t("exampleEntity.detail.deleteModal.cancel")}
        closeLabel={t("exampleEntity.detail.deleteModal.close")}
        confirmClassName="btn btn-error"
        isConfirming={deleteMutation.isPending}
        onConfirm={async () => {
          try {
            await deleteMutation.mutateAsync(entity.id);
            showSuccessToast(t("toast.exampleEntity.deleted"));
            router.push("/dashboard/example-entities");
          } catch {
            showErrorToast(
              t(
                getExampleEntityErrorTranslationKey(
                  deleteMutation.error?.message,
                  "toast.exampleEntity.deleteFailed",
                ),
              ),
            );
          }
        }}
        onCancel={() => {
          if (!deleteMutation.isPending) {
            setIsDeleteModalOpen(false);
          }
        }}
      />
    </>
  );
}
