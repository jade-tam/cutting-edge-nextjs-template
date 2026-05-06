"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";

import { DataTableBulkActions } from "@/components/data-table/data-table-bulk-actions";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import type {
  DataTableBulkAction,
  DataTableColumnDef,
  DataTableSortDirection,
  TableFilterConfig,
  TableFilterValue,
} from "@/components/data-table/types";

type DataTableProps<TData> = {
  rows: TData[];
  columns: DataTableColumnDef<TData>[];
  isLoading?: boolean;
  emptyLabel: string;
  emptyFilteredLabel: string;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  filterConfig?: TableFilterConfig[];
  filterValues?: Record<string, TableFilterValue>;
  onFilterChange?: (id: string, value: TableFilterValue) => void;
  bulkActions?: DataTableBulkAction<TData>[];
  pageSizeOptions?: number[];
  getRowId?: (row: TData, index: number) => string;
  searchPlaceholder?: string;
  searchLabel: string;
  isRowSelectable?: (row: TData, index: number) => boolean;
  toolbarEndContent?: ReactNode;
};

type SortState = {
  columnId: string;
  direction: DataTableSortDirection;
};

function toComparableValue(value: unknown): string | number {
  if (typeof value === "number") {
    return value;
  }

  return String(value ?? "").toLowerCase();
}

function compareValues(a: unknown, b: unknown): number {
  const left = toComparableValue(a);
  const right = toComparableValue(b);

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function toFilterValues(value: TableFilterValue): string[] {
  if (Array.isArray(value)) {
    return value;
  }

  return [value];
}

function matchesFilter(
  cellValue: unknown,
  activeFilter: TableFilterValue,
): boolean {
  const normalizedFilters = toFilterValues(activeFilter)
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0);

  if (normalizedFilters.length === 0) {
    return true;
  }

  if (Array.isArray(cellValue)) {
    const normalizedCellValues = cellValue.map((value) =>
      String(value).toLowerCase(),
    );
    return normalizedFilters.some((value) =>
      normalizedCellValues.includes(value),
    );
  }

  const normalizedCellValue = String(cellValue ?? "").toLowerCase();
  return normalizedFilters.includes(normalizedCellValue);
}

export function DataTable<TData>({
  rows,
  columns,
  isLoading = false,
  emptyLabel,
  emptyFilteredLabel,
  globalFilter,
  onGlobalFilterChange,
  filterConfig = [],
  filterValues,
  onFilterChange,
  bulkActions = [],
  pageSizeOptions,
  getRowId,
  searchPlaceholder,
  searchLabel,
  isRowSelectable = () => true,
  toolbarEndContent,
}: DataTableProps<TData>) {
  const t = useTranslations();
  const rowsPerPageLabel = t("table.rowsPerPage");
  const previousPageLabel = t("table.previousPage");
  const nextPageLabel = t("table.nextPage");
  const pageStatusLabel = (currentPage: number, totalPages: number) =>
    t("table.pageStatus", { currentPage, totalPages });
  const selectedCountLabel = (count: number) =>
    t("table.selectedCount", { count });
  const deselectAllLabel = t("table.deselectAll");
  const selectAllRowsLabel = t("table.selectAllRows");
  const selectRowLabel = (_row: TData, index: number) =>
    t("table.selectRow", { row: index + 1 });
  const sortAscendingLabel = (columnId: string) =>
    t("table.sortAsc", { columnId });
  const sortDescendingLabel = (columnId: string) =>
    t("table.sortDesc", { columnId });
  const clearSortLabel = (columnId: string) =>
    t("table.sortClear", { columnId });
  const clearFiltersLabel = t("table.clearFilters");
  const [localQuery, setLocalQuery] = useState("");
  const [localFilters, setLocalFilters] = useState<
    Record<string, TableFilterValue>
  >({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions?.[0] ?? 10);
  const [sortState, setSortState] = useState<SortState | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  const selectAllRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeQuery = globalFilter ?? localQuery;
  const activeFilters = filterValues ?? localFilters;

  const columnById = useMemo(() => {
    const entries = columns.map((column) => [column.id, column] as const);
    return new Map(entries);
  }, [columns]);

  const getCellValue = useCallback(
    (row: TData, columnId: string): unknown => {
      const column = columnById.get(columnId);
      if (column?.accessorFn) {
        return column.accessorFn(row);
      }

      if (typeof row === "object" && row !== null && columnId in row) {
        return (row as Record<string, unknown>)[columnId];
      }

      return "";
    },
    [columnById],
  );

  const searchableRows = useMemo(() => {
    if (!activeQuery) {
      return rows;
    }

    const normalizedQuery = activeQuery.toLowerCase();
    return rows.filter((row) =>
      columns.some((column) => {
        const value = getCellValue(row, column.id);
        return String(value ?? "")
          .toLowerCase()
          .includes(normalizedQuery);
      }),
    );
  }, [activeQuery, columns, getCellValue, rows]);

  const filteredRows = useMemo(() => {
    const activeFilterEntries = Object.entries(activeFilters).filter(
      ([, value]) => {
        if (Array.isArray(value)) {
          return value.some((item) => item.length > 0);
        }

        return value.length > 0;
      },
    );

    if (activeFilterEntries.length === 0) {
      return searchableRows;
    }

    return searchableRows.filter((row) =>
      activeFilterEntries.every(([filterId, filterValue]) =>
        matchesFilter(getCellValue(row, filterId), filterValue),
      ),
    );
  }, [activeFilters, getCellValue, searchableRows]);

  const sortedRows = useMemo(() => {
    if (!sortState) {
      return filteredRows;
    }

    const column = columnById.get(sortState.columnId);
    if (!column) {
      return filteredRows;
    }

    const rowsCopy = [...filteredRows];
    rowsCopy.sort((left, right) => {
      const leftValue = getCellValue(left, sortState.columnId);
      const rightValue = getCellValue(right, sortState.columnId);
      const comparison = compareValues(leftValue, rightValue);
      return sortState.direction === "asc" ? comparison : -comparison;
    });

    return rowsCopy;
  }, [columnById, filteredRows, getCellValue, sortState]);

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pagedRows = sortedRows.slice(start, end);

  const pagedRowEntries = useMemo(
    () =>
      pagedRows.map((row, index) => ({
        row,
        rowId: getRowId ? getRowId(row, start + index) : String(start + index),
      })),
    [getRowId, pagedRows, start],
  );

  const selectedRows = useMemo(() => {
    const selectedIds = selectedRowIds;
    return sortedRows.filter((row, index) => {
      const rowId = getRowId ? getRowId(row, index) : String(index);
      return selectedIds.has(rowId);
    });
  }, [getRowId, selectedRowIds, sortedRows]);

  const selectablePagedEntries = pagedRowEntries.filter((entry, index) =>
    isRowSelectable(entry.row, start + index),
  );

  const selectedPageCount = selectablePagedEntries.filter((entry) =>
    selectedRowIds.has(entry.rowId),
  ).length;

  const allPageRowsSelected =
    selectablePagedEntries.length > 0 &&
    selectedPageCount === selectablePagedEntries.length;
  const somePageRowsSelected = selectedPageCount > 0 && !allPageRowsSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = somePageRowsSelected;
    }
  }, [somePageRowsSelected]);

  const hasAnyFilter =
    activeQuery.length > 0 ||
    Object.values(activeFilters).some((value) => {
      if (Array.isArray(value)) {
        return value.some((item) => item.length > 0);
      }

      return value.length > 0;
    });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;

      if (event.key.toLowerCase() === "k" && event.ctrlKey && !isTypingTarget) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const hasSelection = selectedRows.length > 0;

  const clearAllFiltersAndSearch = () => {
    if (onGlobalFilterChange) {
      onGlobalFilterChange("");
    } else {
      setLocalQuery("");
    }

    filterConfig.forEach((filter) => {
      if (onFilterChange) {
        onFilterChange(filter.id, "");
      }
    });

    if (!onFilterChange) {
      setLocalFilters({});
    }

    setPage(1);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={`mb-3 flex flex-col ${hasSelection ? "gap-3" : ""}`}>
        <DataTableToolbar
          query={activeQuery}
          onQueryChange={(value) => {
            if (onGlobalFilterChange) {
              onGlobalFilterChange(value);
            } else {
              setLocalQuery(value);
            }

            setPage(1);
          }}
          queryPlaceholder={searchPlaceholder}
          searchLabel={searchLabel}
          searchAriaLabel={searchLabel}
          filters={filterConfig}
          filterValues={activeFilters}
          onFilterChange={(id, value) => {
            if (onFilterChange) {
              onFilterChange(id, value);
            } else {
              setLocalFilters((previous) => ({ ...previous, [id]: value }));
            }

            setPage(1);
          }}
          searchInputRef={searchInputRef}
          endContent={toolbarEndContent}
        />

        <DataTableBulkActions
          selectedRows={selectedRows}
          actions={bulkActions}
          selectedCountLabel={selectedCountLabel}
          deselectAllLabel={deselectAllLabel}
          onClearSelection={() => setSelectedRowIds(new Set())}
        />
      </div>

      <div className="min-h-0 max-h-full overflow-auto rounded-box border border-base-300">
        <table className="table table-sm table-pin-rows w-full bg-base-100">
          <thead className="bg-base-100">
            <tr>
              <th className="w-12">
                <label className="flex items-center justify-center">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    aria-label={selectAllRowsLabel}
                    checked={allPageRowsSelected}
                    onChange={(event) => {
                      const isChecked = event.target.checked;
                      setSelectedRowIds((previous) => {
                        const next = new Set(previous);

                        selectablePagedEntries.forEach((entry) => {
                          if (isChecked) {
                            next.add(entry.rowId);
                          } else {
                            next.delete(entry.rowId);
                          }
                        });

                        return next;
                      });
                    }}
                  />
                </label>
              </th>

              {columns.map((column) => {
                const isSortable =
                  column.enableSorting ?? Boolean(column.accessorFn);
                const isSorted = sortState?.columnId === column.id;
                const direction = isSorted ? sortState.direction : null;

                const nextSortDirection: DataTableSortDirection | null =
                  direction === null
                    ? "asc"
                    : direction === "asc"
                      ? "desc"
                      : null;

                const ariaLabel =
                  direction === "asc"
                    ? sortDescendingLabel(column.id)
                    : direction === "desc"
                      ? clearSortLabel(column.id)
                      : sortAscendingLabel(column.id);

                return (
                  <th key={column.id} className="font-semibold tracking-wide">
                    {isSortable ? (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        aria-label={ariaLabel}
                        onClick={() => {
                          if (!nextSortDirection) {
                            setSortState(null);
                            return;
                          }

                          setSortState({
                            columnId: column.id,
                            direction: nextSortDirection,
                          });
                        }}
                      >
                        <span>{column.header}</span>
                        {direction === "asc" ? (
                          <span
                            className="icon-[fluent--arrow-sort-up-16-regular] size-4"
                            aria-hidden="true"
                          />
                        ) : direction === "desc" ? (
                          <span
                            className="icon-[fluent--arrow-sort-down-16-regular] size-4"
                            aria-hidden="true"
                          />
                        ) : (
                          <span
                            className="icon-[fluent--arrow-sort-16-regular] size-4"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    ) : (
                      <span>{column.header}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-base-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + 1}>
                  <div className="flex flex-col gap-2 p-3">
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-4 w-4/5" />
                    <div className="skeleton h-4 w-3/5" />
                  </div>
                </td>
              </tr>
            ) : pagedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="bg-base-100 p-8">
                  <div className="flex flex-col items-center justify-center gap-2 text-center text-sm opacity-70">
                    <span
                      className="icon-[fluent--search-24-regular] text-2xl opacity-80"
                      aria-hidden="true"
                    />
                    <span>
                      {hasAnyFilter ? emptyFilteredLabel : emptyLabel}
                    </span>
                    {hasAnyFilter ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-warning mt-2"
                        onClick={clearAllFiltersAndSearch}
                      >
                        {clearFiltersLabel}
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ) : (
              pagedRowEntries.map(({ row, rowId }, rowIndex) => {
                const isSelected = selectedRowIds.has(rowId);
                const selectable = isRowSelectable(row, start + rowIndex);

                return (
                  <tr
                    key={rowId}
                    data-state={isSelected ? "selected" : undefined}
                  >
                    <td className="w-12">
                      {selectable ? (
                        <label className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            aria-label={selectRowLabel(row, start + rowIndex)}
                            checked={isSelected}
                            onChange={(event) => {
                              const isChecked = event.target.checked;
                              setSelectedRowIds((previous) => {
                                const next = new Set(previous);
                                if (isChecked) {
                                  next.add(rowId);
                                } else {
                                  next.delete(rowId);
                                }
                                return next;
                              });
                            }}
                          />
                        </label>
                      ) : null}
                    </td>
                    {columns.map((column) => (
                      <td key={column.id} className={column.meta?.className}>
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
          {!isLoading ? (
            <tfoot className="bg-base-100">
              <tr>
                <td colSpan={columns.length + 1} className="p-0">
                  <DataTablePagination
                    page={page}
                    pageSize={pageSize}
                    totalItems={sortedRows.length}
                    pageSizeOptions={pageSizeOptions}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      setPage(1);
                    }}
                    pageStatusLabel={pageStatusLabel}
                    rowsPerPageLabel={rowsPerPageLabel}
                    previousPageLabel={previousPageLabel}
                    nextPageLabel={nextPageLabel}
                  />
                </td>
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
    </div>
  );
}
