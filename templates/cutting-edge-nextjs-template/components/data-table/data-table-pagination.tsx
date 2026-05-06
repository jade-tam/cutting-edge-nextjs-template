"use client";

type DataTablePaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageStatusLabel: (currentPage: number, totalPages: number) => string;
  rowsPerPageLabel: string;
  previousPageLabel: string;
  nextPageLabel: string;
};

export function DataTablePagination({
  page,
  pageSize,
  totalItems,
  pageSizeOptions = [10, 25, 50],
  onPageChange,
  onPageSizeChange,
  pageStatusLabel,
  rowsPerPageLabel,
  previousPageLabel,
  nextPageLabel,
}: DataTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  return (
    <div className="w-full px-4 py-3 bg-base-100">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="min-w-0 truncate text-xs opacity-70 sm:text-sm">
          {pageStatusLabel(currentPage, totalPages)}
        </div>

        <div className="flex min-w-0 shrink-0 items-center justify-end gap-2">
          <label className="flex items-center gap-2">
            <span className="hidden text-xs text-base-content/70 sm:inline">
              {rowsPerPageLabel}
            </span>
            <select
              className="select select-bordered select-sm"
              value={String(pageSize)}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              aria-label={rowsPerPageLabel}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <div className="join">
            <button
              type="button"
              className="btn btn-square btn-sm join-item"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
              aria-label={previousPageLabel}
            >
              <span className="icon-[fluent--chevron-left-24-regular] size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="btn btn-square btn-sm join-item"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              aria-label={nextPageLabel}
            >
              <span className="icon-[fluent--chevron-right-24-regular] size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
