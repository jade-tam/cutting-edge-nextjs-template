"use client";

import type { ReactNode, RefObject } from "react";

import type {
  TableFilterConfig,
  TableFilterValue,
} from "@/components/data-table/types";

type DataTableToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  queryPlaceholder?: string;
  searchInputRef?: RefObject<HTMLInputElement | null>;
  filters?: TableFilterConfig[];
  filterValues?: Record<string, TableFilterValue>;
  onFilterChange?: (id: string, value: TableFilterValue) => void;
  searchLabel?: string;
  searchAriaLabel?: string;
  endContent?: ReactNode;
};

export function DataTableToolbar({
  query,
  onQueryChange,
  queryPlaceholder,
  searchInputRef,
  filters = [],
  filterValues = {},
  onFilterChange,
  searchLabel,
  searchAriaLabel,
  endContent,
}: DataTableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <label className="input input-bordered input-sm flex w-full items-center gap-2 md:max-w-sm">
          <span className="icon-[fluent--search-24-regular] size-4 opacity-60" aria-hidden="true" />
          <span className="sr-only">{searchLabel}</span>
          <input
            ref={searchInputRef}
            type="search"
            role="searchbox"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={queryPlaceholder}
            className="grow"
            aria-label={searchAriaLabel ?? searchLabel}
          />
          <kbd className="kbd kbd-sm">Ctrl</kbd>
          <kbd className="kbd kbd-sm">K</kbd>
        </label>

        <div className="flex w-full items-center justify-between gap-2 md:w-auto md:justify-end">
          {filters.map((filter) => {
            const activeValue = filterValues[filter.id];

            if (filter.isMulti) {
              const values = Array.isArray(activeValue)
                ? activeValue
                : activeValue
                  ? [activeValue]
                  : [];

              return (
                <label key={filter.id} className="flex items-center">
                  <span className="sr-only">{filter.label}</span>
                  <select
                    multiple
                    value={values}
                    onChange={(event) => {
                      const nextValues = Array.from(event.target.selectedOptions).map((option) => option.value);
                      onFilterChange?.(filter.id, nextValues);
                    }}
                    aria-label={filter.label}
                    className="select select-bordered select-sm"
                  >
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              );
            }

            return (
              <label key={filter.id} className="flex items-center">
                <span className="sr-only">{filter.label}</span>
                <select
                  value={typeof activeValue === "string" ? activeValue : ""}
                  onChange={(event) => onFilterChange?.(filter.id, event.target.value)}
                  aria-label={filter.label}
                  className="select select-bordered select-sm"
                >
                  <option value="">{filter.clearOptionLabel ?? filter.label}</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            );
          })}

          {endContent}
        </div>
      </div>

    </div>
  );
}
