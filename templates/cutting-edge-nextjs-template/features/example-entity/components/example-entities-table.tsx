"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { showErrorToast, showSuccessToast } from "@/lib/toast/toast";

import { ConfirmationModal } from "@/components/confirmation-modal";
import { DataTable } from "@/components/data-table/data-table";
import type {
  DataTableBulkAction,
  DataTableColumnDef,
  DataTableSortDirection,
  TableFilterConfig,
  TableFilterValue,
} from "@/components/data-table/types";
import {
  formatEntityDate,
  parseTableUrlState,
  toTableUrlSearchParams,
} from "@/components/data-table/utils";
import { useDeleteExampleEntity } from "@/features/example-entity/hooks/use-delete-example-entity";
import { useExampleEntities } from "@/features/example-entity/hooks/use-example-entities";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import type { ExampleEntity } from "@/lib/example-entity/types";
import { getExampleEntityErrorTranslationKey } from "@/lib/toast/messages";

function parseSort(sortValue: string): {
  columnId: string;
  direction: DataTableSortDirection;
} | null {
  const [columnId, direction] = sortValue.split(".");

  if (!columnId || (direction !== "asc" && direction !== "desc")) {
    return null;
  }

  return { columnId, direction };
}

function sortExampleEntities(rows: ExampleEntity[], sortValue: string): ExampleEntity[] {
  const sort = parseSort(sortValue);
  if (!sort) {
    return rows;
  }

  const sorted = [...rows];
  sorted.sort((left, right) => {
    if (sort.columnId === "updatedAt") {
      const leftDate = new Date(left.updatedAt).getTime();
      const rightDate = new Date(right.updatedAt).getTime();
      return sort.direction === "asc" ? leftDate - rightDate : rightDate - leftDate;
    }

    const leftValue = String(left[sort.columnId as keyof ExampleEntity] ?? "").toLowerCase();
    const rightValue = String(right[sort.columnId as keyof ExampleEntity] ?? "").toLowerCase();
    const comparison = leftValue.localeCompare(rightValue, undefined, {
      numeric: true,
      sensitivity: "base",
    });

    return sort.direction === "asc" ? comparison : -comparison;
  });

  return sorted;
}

export function getStatusBadgeClass(status: ExampleEntity["status"]): string {
  switch (status) {
    case "draft":
      return "badge-warning";
    case "in_review":
      return "badge-info";
    case "published":
      return "badge-success";
    case "archived":
      return "badge-neutral";
  }
}

export function getPriorityBadgeClass(priority: ExampleEntity["priority"]): string {
  switch (priority) {
    case "low":
      return "badge-neutral";
    case "medium":
      return "badge-info";
    case "high":
      return "badge-warning";
    case "urgent":
      return "badge-error";
  }
}

export function getOwnerBadgeClass(): string {
  return "badge-accent";
}

export function badgeClass(colorClass: string): string {
  return `badge badge-xs whitespace-nowrap ${colorClass}`;
}

export default function ExampleEntitiesTable() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);

  const urlState = useMemo(
    () => parseTableUrlState(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const query = urlState.query;
  const filters = urlState.filters;
  const sort = urlState.sort;

  const [searchInputValue, setSearchInputValue] = useState(query);

  useEffect(() => {
    setSearchInputValue(query);
  }, [query]);

  const listQuery = useExampleEntities();
  const deleteMutation = useDeleteExampleEntity();

  const pushUrlState = useCallback(
    (nextQuery: string, nextSort: string, nextFilters: Record<string, TableFilterValue>) => {
      const params = toTableUrlSearchParams({
        page: 1,
        size: 10,
        sort: nextSort,
        query: nextQuery,
        filters: nextFilters,
      });

      const queryString = params.toString();
      router.replace(queryString.length > 0 ? `${pathname}?${queryString}` : pathname);
    },
    [pathname, router],
  );

  useEffect(() => {
    if (searchInputValue === query) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      pushUrlState(searchInputValue, sort, filters);
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [filters, pushUrlState, query, searchInputValue, sort]);

  const cycleSort = useCallback(
    (columnId: string) => {
      const currentSort = parseSort(sort);
      const nextSort =
        currentSort?.columnId !== columnId
          ? `${columnId}.asc`
          : currentSort.direction === "asc"
            ? `${columnId}.desc`
            : "";

      pushUrlState(searchInputValue, nextSort, filters);
    },
    [filters, pushUrlState, searchInputValue, sort],
  );

  const sortedRows = useMemo(() => {
    if (!listQuery.data) {
      return [];
    }

    return sortExampleEntities(listQuery.data, sort);
  }, [listQuery.data, sort]);

  const activeSort = parseSort(sort);

  const columns = useMemo<DataTableColumnDef<ExampleEntity>[]>(
    () => [
      {
        id: "title",
        header: (
          <button
            type="button"
            className="btn btn-ghost gap-1 font-bold"
            aria-label={
              activeSort?.columnId === "title" && activeSort.direction === "asc"
                ? t("exampleEntity.table.sortAria.title.desc")
                : t("exampleEntity.table.sortAria.title.asc")
            }
            onClick={() => cycleSort("title")}
          >
            <span>{t("exampleEntity.table.columns.title")}</span>
            {activeSort?.columnId === "title" ? (
              activeSort.direction === "asc" ? (
                <span className="icon-[fluent--arrow-sort-up-16-regular] size-4" aria-hidden="true" />
              ) : (
                <span className="icon-[fluent--arrow-sort-down-16-regular] size-4" aria-hidden="true" />
              )
            ) : (
              <span className="icon-[fluent--arrow-sort-16-regular] size-4" aria-hidden="true" />
            )}
          </button>
        ),
        accessorFn: (row) => row.title,
        cell: (row) => <span className="font-medium">{row.title}</span>,
        enableSorting: false,
      },
      {
        id: "status",
        header: <span>{t("exampleEntity.table.columns.status")}</span>,
        accessorFn: (row) => row.status,
        cell: (row) => (
          <span className={badgeClass(getStatusBadgeClass(row.status))}>
            {t(`exampleEntity.form.fields.status.options.${row.status}`)}
          </span>
        ),
        enableSorting: false,
      },
      {
        id: "priority",
        header: <span>{t("exampleEntity.table.columns.priority")}</span>,
        accessorFn: (row) => row.priority,
        cell: (row) => (
          <span className={badgeClass(getPriorityBadgeClass(row.priority))}>
            {t(`exampleEntity.form.fields.priority.options.${row.priority}`)}
          </span>
        ),
        enableSorting: false,
      },
      {
        id: "ownerName",
        header: <span>{t("exampleEntity.table.columns.owner")}</span>,
        accessorFn: (row) => row.ownerName,
        cell: (row) => <span className={badgeClass(getOwnerBadgeClass())}>{row.ownerName}</span>,
        enableSorting: false,
      },
      {
        id: "updatedAt",
        header: (
          <button
            type="button"
            className="btn btn-ghost gap-1 font-bold"
            aria-label={
              activeSort?.columnId === "updatedAt" && activeSort.direction === "asc"
                ? t("exampleEntity.table.sortAria.updated.desc")
                : t("exampleEntity.table.sortAria.updated.asc")
            }
            onClick={() => cycleSort("updatedAt")}
          >
            <span>{t("exampleEntity.table.columns.updated")}</span>
            {activeSort?.columnId === "updatedAt" ? (
              activeSort.direction === "asc" ? (
                <span className="icon-[fluent--arrow-sort-up-16-regular] size-4" aria-hidden="true" />
              ) : (
                <span className="icon-[fluent--arrow-sort-down-16-regular] size-4" aria-hidden="true" />
              )
            ) : (
              <span className="icon-[fluent--arrow-sort-16-regular] size-4" aria-hidden="true" />
            )}
          </button>
        ),
        accessorFn: (row) => row.updatedAt,
        cell: (row) => formatEntityDate(row.updatedAt, locale),
        enableSorting: false,
      },
      {
        id: "actions",
        header: <span>{t("exampleEntity.table.columns.actions")}</span>,
        accessorFn: () => "",
        enableSorting: false,
        meta: {
          className: "space-x-2 text-right whitespace-nowrap",
          isActions: true,
        },
        cell: (entity) => {
          const isDeleting =
            deleteMutation.isPending && deleteMutation.variables === entity.id;

          return (
            <>
              <Link
                href={`/dashboard/example-entities/${entity.id}`}
                className="btn btn-sm btn-soft"
              >
                <span className="icon-[fluent--eye-24-regular] size-4" aria-hidden="true" />
                {t("exampleEntity.table.actions.view")}
              </Link>
              <Link
                href={`/dashboard/example-entities/${entity.id}/edit`}
                className="btn btn-sm btn-soft btn-warning"
              >
                <span className="icon-[fluent--edit-24-regular] size-4" aria-hidden="true" />
                {t("exampleEntity.table.actions.edit")}
              </Link>
              <button
                type="button"
                className="btn btn-sm btn-soft btn-error"
                onClick={() => setPendingDeleteIds([entity.id])}
                disabled={isDeleting}
              >
                <span className="icon-[fluent--delete-24-regular] size-4" aria-hidden="true" />
                {t("exampleEntity.table.actions.delete")}
              </button>
            </>
          );
        },
      },
    ],
    [activeSort, cycleSort, deleteMutation.isPending, deleteMutation.variables, locale, t],
  );

  const filterConfig = useMemo<TableFilterConfig[]>(
    () => [
      {
        id: "status",
        label: t("exampleEntity.table.toolbar.statusFilterLabel"),
        clearOptionLabel: t("exampleEntity.table.toolbar.allStatusesLabel"),
        options: ["draft", "in_review", "published", "archived"].map((status) => ({
          value: status,
          label: t(`exampleEntity.form.fields.status.options.${status}`),
        })),
      },
    ],
    [t],
  );

  const bulkActions = useMemo<DataTableBulkAction<ExampleEntity>[]>(
    () => [
      {
        id: "bulk-delete",
        label: (
          <>
            <span className="icon-[fluent--delete-24-regular] size-4" aria-hidden="true" />
            {t("exampleEntity.table.bulkActions.delete")}
          </>
        ),
        className: "btn btn-sm btn-error",
        onClick: (selectedRows) => {
          setPendingDeleteIds(selectedRows.map((row) => row.id));
        },
      },
    ],
    [t],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (pendingDeleteIds.length === 0) {
      return;
    }

    try {
      for (const id of pendingDeleteIds) {
        await deleteMutation.mutateAsync(id);
      }

      showSuccessToast(
        pendingDeleteIds.length > 1
          ? t("exampleEntity.table.bulkActions.deleteSuccess", { count: pendingDeleteIds.length })
          : t("toast.exampleEntity.deleted"),
      );
      setPendingDeleteIds([]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : undefined;

      showErrorToast(
        t(
          getExampleEntityErrorTranslationKey(
            errorMessage,
            "toast.exampleEntity.deleteFailed",
          ),
        ),
      );
    }
  }, [deleteMutation, pendingDeleteIds, t]);

  const isBulkDelete = pendingDeleteIds.length > 1;
  const pendingDeleteTitle =
    pendingDeleteIds.length === 1
      ? sortedRows.find((row) => row.id === pendingDeleteIds[0])?.title ?? pendingDeleteIds[0]
      : "";

  if (listQuery.isError) {
    return (
      <div className="alert alert-error">
        {t(
          getExampleEntityErrorTranslationKey(
            listQuery.error.message,
            "toast.exampleEntity.loadListFailed",
          ),
        )}
      </div>
    );
  }

  return (
    <div className="h-full min-h-0">
      <DataTable
        rows={sortedRows}
        toolbarEndContent={
          <Link
            href="/dashboard/example-entities/new"
            className="btn btn-primary btn-sm whitespace-nowrap"
          >
            <span className="icon-[fluent--add-24-regular] size-4" aria-hidden="true" />
            {t("pages.exampleEntities.createAction")}
          </Link>
        }
        columns={columns}
        isLoading={listQuery.isPending}
        emptyLabel={t("exampleEntity.table.empty")}
        emptyFilteredLabel={t("exampleEntity.table.empty")}
        globalFilter={searchInputValue}
        onGlobalFilterChange={(value) => {
          setSearchInputValue(value);
        }}
        filterConfig={filterConfig}
        filterValues={filters}
        onFilterChange={(id, value) => {
          const nextFilters = {
            ...filters,
            [id]: value,
          };
          pushUrlState(searchInputValue, sort, nextFilters);
        }}
        bulkActions={bulkActions}
        searchLabel={t("exampleEntity.table.toolbar.searchLabel")}
        searchPlaceholder={t("exampleEntity.table.toolbar.searchPlaceholder")}
        getRowId={(row) => row.id}
      />

      <ConfirmationModal
        isOpen={pendingDeleteIds.length > 0}
        title={
          isBulkDelete
            ? t("exampleEntity.table.bulkActions.deleteModal.title", {
                count: pendingDeleteIds.length,
              })
            : t("exampleEntity.table.deleteModal.title")
        }
        message={
          isBulkDelete
            ? t("exampleEntity.table.bulkActions.deleteModal.description", {
                count: pendingDeleteIds.length,
              })
            : t("exampleEntity.table.deleteModal.description", {
                title: pendingDeleteTitle,
              })
        }
        confirmLabel={
          deleteMutation.isPending
            ? t("exampleEntity.table.deleteModal.deleting")
            : isBulkDelete
              ? t("exampleEntity.table.bulkActions.delete")
              : t("exampleEntity.table.actions.delete")
        }
        cancelLabel={t("exampleEntity.table.deleteModal.cancel")}
        closeLabel={t("exampleEntity.table.deleteModal.cancel")}
        confirmClassName="btn btn-error"
        isConfirming={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!deleteMutation.isPending) {
            setPendingDeleteIds([]);
          }
        }}
      />

    </div>
  );
}
