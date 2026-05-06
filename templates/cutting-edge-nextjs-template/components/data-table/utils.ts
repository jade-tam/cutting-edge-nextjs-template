import type { TableUrlState } from "@/components/data-table/types";

const DEFAULT_TABLE_URL_STATE: TableUrlState = {
  page: 1,
  size: 10,
  sort: "",
  query: "",
  filters: {},
};

function toPositiveInteger(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

export function parseTableUrlState(params: URLSearchParams): TableUrlState {
  const filters: TableUrlState["filters"] = {};

  for (const key of new Set(params.keys())) {
    if (!key.startsWith("f_")) {
      continue;
    }

    const values = params.getAll(key).filter((value) => value.length > 0);
    if (values.length === 0) {
      continue;
    }

    const filterKey = key.replace("f_", "");
    filters[filterKey] = values.length === 1 ? values[0] : values;
  }

  return {
    page: toPositiveInteger(params.get("page"), DEFAULT_TABLE_URL_STATE.page),
    size: toPositiveInteger(params.get("size"), DEFAULT_TABLE_URL_STATE.size),
    sort: params.get("sort") ?? DEFAULT_TABLE_URL_STATE.sort,
    query: params.get("q") ?? DEFAULT_TABLE_URL_STATE.query,
    filters,
  };
}

export function toTableUrlSearchParams(state: TableUrlState): URLSearchParams {
  const params = new URLSearchParams();

  if (state.page > 0) {
    params.set("page", String(state.page));
  }

  if (state.size > 0) {
    params.set("size", String(state.size));
  }

  if (state.sort.length > 0) {
    params.set("sort", state.sort);
  }

  if (state.query.length > 0) {
    params.set("q", state.query);
  }

  for (const [key, value] of Object.entries(state.filters)) {
    if (Array.isArray(value)) {
      value
        .filter((item) => item.length > 0)
        .forEach((item) => params.append(`f_${key}`, item));
      continue;
    }

    if (value.length > 0) {
      params.set(`f_${key}`, value);
    }
  }

  return params;
}

export function formatEntityDate(input: string | null, locale: string): string {
  if (!input) {
    return "-";
  }

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

export function debounce<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  waitMs = 250,
): (...args: TArgs) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: TArgs) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      callback(...args);
    }, waitMs);
  };
}
