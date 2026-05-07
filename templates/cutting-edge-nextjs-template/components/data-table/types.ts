import type { ReactNode } from "react";

export type TableFilterValue = string | string[];

export type TableUrlState = {
  page: number;
  size: number;
  sort: string;
  query: string;
  filters: Record<string, TableFilterValue>;
};

export type TableFilterOption = {
  label: string;
  value: string;
};

export type TableFilterConfig = {
  id: string;
  label: string;
  options: TableFilterOption[];
  clearOptionLabel?: string;
  isMulti?: boolean;
};

export type DataTableColumnMeta = {
  className?: string;
  isActions?: boolean;
};

export type DataTableSortDirection = "asc" | "desc";

export type DataTableColumnDef<TData> = {
  id: string;
  header: ReactNode;
  accessorFn?: (row: TData) => unknown;
  cell: (row: TData) => ReactNode;
  meta?: DataTableColumnMeta;
  enableSorting?: boolean;
};

export type DataTableBulkAction<TData> = {
  id: string;
  label: ReactNode;
  onClick: (rows: TData[]) => void;
  className?: string;
};
