import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DataTable } from "@/components/data-table/data-table";
import type { DataTableColumnDef } from "@/components/data-table/types";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, string | number>) => {
    const translations: Record<string, string> = {
      "table.rowsPerPage": "Rows per page",
      "table.previousPage": "Previous page",
      "table.nextPage": "Next page",
      "table.pageStatus": "Page {currentPage} of {totalPages}",
      "table.selectedCount": "{count} selected",
      "table.deselectAll": "Deselect all",
      "table.selectAllRows": "Select all rows",
      "table.selectRow": "Select row {row}",
      "table.sortAsc": "Sort by {columnId} ascending",
      "table.sortDesc": "Sort by {columnId} descending",
      "table.sortClear": "Clear sort for {columnId}",
      "table.clearFilters": "Clear filters",
    };

    const template = translations[key] ?? key;
    if (!values) {
      return template;
    }

    return Object.entries(values).reduce(
      (message, [token, value]) => message.replaceAll(`{${token}}`, String(value)),
      template,
    );
  },
}));



type Row = {
  id: string;
  title: string;
  status: string;
  action: string;
};

const columns: DataTableColumnDef<Row>[] = [
  {
    id: "title",
    header: "Title",
    accessorFn: (row) => row.title,
    cell: (row) => row.title,
    enableSorting: true,
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => row.status,
  }
];

const columnsWithActions: DataTableColumnDef<Row>[] = [
  ...columns,
  {
    id: "actions",
    header: "Actions",
    accessorFn: (row) => row.action,
    cell: () => (
      <div>
        <button type="button" className="sm:hidden btn btn-square btn-sm" aria-label="Open actions">
          •••
        </button>
        <button type="button" className="hidden sm:inline-flex btn btn-sm">
          Edit
        </button>
      </div>
    ),
    meta: {
      isActions: true,
    },
    enableSorting: false,
  },
];

afterEach(() => {
  cleanup();
});

const rows: Row[] = [
  {
    id: "1",
    title: "Roadmap",
    status: "draft",
    action: "edit",
  },
  {
    id: "2",
    title: "Alpha",
    status: "published",
    action: "edit",
  },
];

describe("DataTable", () => {
  it("renders loading skeleton and filtered empty state", () => {
    const { rerender, container } = render(
      <DataTable<Row>
        rows={[]}
        columns={columns}
        isLoading
        emptyLabel="No data"
        emptyFilteredLabel="No matches"
        searchLabel="Search entities"
      />,
    );

    expect(container.querySelector(".skeleton")).not.toBeNull();

    rerender(
      <DataTable<Row>
        rows={[]}
        columns={columns}
        emptyLabel="No data"
        emptyFilteredLabel="No matches"
        globalFilter="roadmap"
        searchLabel="Search entities"
      />,
    );

    expect(screen.getByText("No matches")).toBeInTheDocument();
  });

  it("uses internalized sort and selection labels", () => {
    render(
      <DataTable<Row>
        rows={rows}
        columns={columns}
        emptyLabel="No data"
        emptyFilteredLabel="No matches"
        searchLabel="Search entities"
        searchPlaceholder="Search entities"
        getRowId={(row) => row.id}
      />,
    );

    expect(screen.getByRole("button", { name: "Sort by title ascending" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Select all rows" })).toBeInTheDocument();
  });

  it("supports sortable columns", () => {
    render(
      <DataTable<Row>
        rows={rows}
        columns={columns}
        emptyLabel="No data"
        emptyFilteredLabel="No matches"
        searchLabel="Search entities"
        getRowId={(row) => row.id}
      />,
    );

    const titleSortButton = screen.getByRole("button", {
      name: "Sort by title ascending",
    });

    fireEvent.click(titleSortButton);

    const bodyRowsAfterAsc = screen.getAllByRole("row").slice(1);
    expect(bodyRowsAfterAsc[0]).toHaveTextContent("Alpha");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sort by title descending",
      }),
    );

    const bodyRowsAfterDesc = screen.getAllByRole("row").slice(1);
    expect(bodyRowsAfterDesc[0]).toHaveTextContent("Roadmap");
  });

  it("applies filter values and exposes accessible search control", () => {
    render(
      <DataTable<Row>
        rows={rows}
        columns={columns}
        emptyLabel="No data"
        emptyFilteredLabel="No matches"
        searchLabel="Search entities"
        filterConfig={[
          {
            id: "status",
            label: "Status",
            options: [
              { label: "Draft", value: "draft" },
              { label: "Published", value: "published" },
            ],
          },
        ]}
        getRowId={(row) => row.id}
      />,
    );

    const searchInput = screen.getByRole("searchbox", { name: "Search entities" });
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "draft" } });

    expect(screen.getByText("Roadmap")).toBeInTheDocument();
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox", { name: "Status" }), {
      target: { value: "draft" },
    });

    expect(screen.getByText("Roadmap")).toBeInTheDocument();
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
  });

  it("tracks row selection and renders bulk actions", () => {
    const onBulkAction = vi.fn();

    render(
      <DataTable<Row>
        rows={rows}
        columns={columnsWithActions}
        emptyLabel="No data"
        emptyFilteredLabel="No matches"
        searchLabel="Search entities"
        getRowId={(row) => row.id}
        bulkActions={[
          {
            id: "delete",
            label: "Delete",
            onClick: onBulkAction,
          },
        ]}
      />,
    );

    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("checkbox", { name: "Select row 1" }));

    expect(screen.getByText("1 selected")).toBeInTheDocument();
    const deleteButton = screen.getByRole("button", { name: "Delete" });
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);
    expect(onBulkAction).toHaveBeenCalledTimes(1);
    expect(onBulkAction.mock.calls[0]?.[0]).toHaveLength(1);
    expect(onBulkAction.mock.calls[0]?.[0][0]).toMatchObject({ id: "1" });
  });

  it("clears search and filters from filtered empty state action", () => {
    const onGlobalFilterChange = vi.fn();
    const onFilterChange = vi.fn();

    render(
      <DataTable<Row>
        rows={rows}
        columns={columns}
        emptyLabel="No data"
        emptyFilteredLabel="No matches"
        searchLabel="Search entities"
        globalFilter="missing"
        onGlobalFilterChange={onGlobalFilterChange}
        filterConfig={[
          {
            id: "status",
            label: "Status",
            options: [
              { label: "Draft", value: "draft" },
              { label: "Published", value: "published" },
            ],
          },
        ]}
        filterValues={{ status: "draft" }}
        onFilterChange={onFilterChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(onGlobalFilterChange).toHaveBeenCalledWith("");
    expect(onFilterChange).toHaveBeenCalledWith("status", "");
  });

  it("shows icon-only action buttons on mobile classes", () => {
    const { container } = render(
      <DataTable<Row>
        rows={rows}
        columns={columnsWithActions}
        emptyLabel="No data"
        emptyFilteredLabel="No matches"
        searchLabel="Search entities"
      />,
    );

    expect(container.querySelector(".sm\\:hidden")).not.toBeNull();
  });
});
