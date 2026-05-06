"use client";

import type { DataTableBulkAction } from "@/components/data-table/types";

type DataTableBulkActionsProps<TData> = {
  selectedRows: TData[];
  actions: DataTableBulkAction<TData>[];
  selectedCountLabel: (count: number) => string;
  onClearSelection?: () => void;
  deselectAllLabel?: string;
};

export function DataTableBulkActions<TData>({
  selectedRows,
  actions,
  selectedCountLabel,
  onClearSelection,
  deselectAllLabel = "Deselect all",
}: DataTableBulkActionsProps<TData>) {
  const hasSelection = selectedRows.length > 0;

  return (
    <div
      className={`grid transition-all duration-200 ease-out ${
        hasSelection ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
      aria-hidden={!hasSelection}
    >
      <div className="overflow-hidden">
        <div className="alert flex flex-col gap-2 rounded-box border border-base-300 bg-base-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm">{selectedCountLabel(selectedRows.length)}</span>

          <div className="flex flex-wrap items-center gap-2">
            {onClearSelection ? (
              <button type="button" className="btn btn-sm btn-ghost" onClick={onClearSelection}>
                <span className="icon-[fluent--dismiss-24-regular] size-4" aria-hidden="true" />
                {deselectAllLabel}
              </button>
            ) : null}
            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                className={action.className ?? "btn btn-sm"}
                onClick={() => action.onClick(selectedRows)}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
