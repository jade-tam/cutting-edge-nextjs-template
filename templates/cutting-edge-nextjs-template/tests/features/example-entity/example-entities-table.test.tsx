import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ExampleEntitiesTable from "@/features/example-entity/components/example-entities-table";
import type { ExampleEntity } from "@/lib/example-entity/types";

const {
  replace,
  mutateAsync,
  toastSuccess,
  toastError,
} = vi.hoisted(() => ({
  replace: vi.fn(),
  mutateAsync: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

let searchParamsValue = "q=roadmap&sort=updatedAt.desc&f_status=draft";
let searchParamsState = new URLSearchParams(searchParamsValue);
let listQueryState: {
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  data: ExampleEntity[];
} = {
  isPending: false,
  isError: false,
  error: null,
  data: [
    {
      id: "entity-1",
      title: "Roadmap 2026",
      body: "Roadmap body",
      slug: "roadmap-2026",
      summary: "Roadmap summary",
      status: "draft",
      category: "product",
      tags: ["roadmap"],
      priority: "high",
      ownerName: "Jane Doe",
      dueDate: null,
      isFeatured: false,
      publishedAt: null,
      estimatedHours: 10,
      progressPercent: 45,
      attachmentsUrl: [],
      externalLink: null,
      notes: "",
      createdAt: "2026-04-01T00:00:00.000Z",
      updatedAt: "2026-04-12T09:30:00.000Z",
    },
  ],
};

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, string | number>) => {
    const translations: Record<string, string> = {
      "exampleEntity.table.loading": "Loading example entities...",
      "exampleEntity.table.empty": "No example entities yet.",
      "exampleEntity.table.columns.title": "Title",
      "exampleEntity.table.columns.status": "Status",
      "exampleEntity.table.columns.priority": "Priority",
      "exampleEntity.table.columns.owner": "Owner",
      "exampleEntity.table.columns.updated": "Updated",
      "exampleEntity.table.columns.actions": "Actions",
      "exampleEntity.table.sortAria.title.asc": "Sort by title ascending",
      "exampleEntity.table.sortAria.title.desc": "Sort by title descending",
      "exampleEntity.table.sortAria.updated.asc": "Sort by updated ascending",
      "exampleEntity.table.sortAria.updated.desc": "Sort by updated descending",
      "exampleEntity.table.actions.view": "View",
      "exampleEntity.table.actions.edit": "Edit",
      "exampleEntity.table.actions.delete": "Delete",
      "exampleEntity.table.deleteModal.title": "Delete example entity?",
      "exampleEntity.table.deleteModal.description": "Are you sure you want to delete \"{title}\"? This action cannot be undone.",
      "exampleEntity.table.deleteModal.cancel": "Cancel",
      "exampleEntity.table.deleteModal.deleting": "Deleting...",
      "exampleEntity.form.fields.status.label": "Status",
      "exampleEntity.table.toolbar.searchLabel": "Search entities",
      "exampleEntity.table.toolbar.searchPlaceholder": "Search by title, owner, or status",
      "exampleEntity.table.toolbar.statusFilterLabel": "Filter by status",
      "exampleEntity.table.toolbar.allStatusesLabel": "All statuses",
      "table.rowsPerPage": "Rows per page",
      "table.previousPage": "Previous page",
      "table.nextPage": "Next page",
      "table.pageStatus": "Page {currentPage} of {totalPages}",
      "table.selectedCount": "{count} selected",
      "table.selectAllRows": "Select all rows",
      "table.selectRow": "Select row {row}",
      "table.deselectAll": "Deselect all",
      "table.sortAsc": "Sort by {columnId} ascending",
      "table.sortDesc": "Sort by {columnId} descending",
      "table.sortClear": "Clear sort for {columnId}",
      "exampleEntity.table.toolbar.rowsPerPageLabel": "Rows",
      "exampleEntity.table.toolbar.previousPageLabel": "Previous",
      "exampleEntity.table.toolbar.nextPageLabel": "Next",
      "exampleEntity.table.toolbar.pageStatusLabel": "Page {currentPage} of {totalPages}",
      "exampleEntity.table.toolbar.selectedCountLabel": "{count} selected",
      "exampleEntity.table.toolbar.selectAllRowsLabel": "Select all rows",
      "exampleEntity.table.toolbar.selectRowLabel": "Select row {rowIndex}",
      "exampleEntity.table.bulkActions.delete": "Delete selected",
      "exampleEntity.table.bulkActions.deleteSuccess": "Deleted {count} entities.",
      "exampleEntity.table.bulkActions.deleteModal.title": "Delete {count} selected entities?",
      "exampleEntity.table.bulkActions.deleteModal.description": "These entities will be permanently deleted.",
      "exampleEntity.table.toolbar.deselectAllLabel": "Deselect all",
      "exampleEntity.form.fields.status.options.draft": "Draft",
      "exampleEntity.form.fields.status.options.in_review": "In review",
      "exampleEntity.form.fields.status.options.published": "Published",
      "exampleEntity.form.fields.status.options.archived": "Archived",
      "toast.exampleEntity.deleted": "Deleted",
      "toast.exampleEntity.deleteFailed": "Unable to delete example entity.",
      "toast.exampleEntity.loadListFailed": "Unable to load example entities.",
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
  useLocale: () => "en-US",
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => searchParamsState,
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/dashboard/example-entities",
  Link: ({ href, className, children }: { href: string; className?: string; children: ReactNode }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("@/features/example-entity/hooks/use-example-entities", () => ({
  useExampleEntities: () => listQueryState,
}));

vi.mock("@/features/example-entity/hooks/use-delete-example-entity", () => ({
  useDeleteExampleEntity: () => ({
    isPending: false,
    variables: undefined,
    mutateAsync,
    error: null,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: toastSuccess,
    error: toastError,
  },
}));

describe("ExampleEntitiesTable", () => {
  beforeEach(() => {
    cleanup();

    replace.mockReset();
    mutateAsync.mockReset();
    toastSuccess.mockReset();
    toastError.mockReset();

    searchParamsValue = "q=roadmap&sort=updatedAt.desc&f_status=draft";
    searchParamsState = new URLSearchParams(searchParamsValue);
    replace.mockImplementation((nextHref: string) => {
      const [, queryString = ""] = nextHref.split("?");
      searchParamsState = new URLSearchParams(queryString);
    });

    listQueryState = {
      isPending: false,
      isError: false,
      error: null,
      data: [
        {
          id: "entity-1",
          title: "Roadmap 2026",
          body: "Roadmap body",
          slug: "roadmap-2026",
          summary: "Roadmap summary",
          status: "draft",
          category: "product",
          tags: ["roadmap"],
          priority: "high",
          ownerName: "Jane Doe",
          dueDate: null,
          isFeatured: false,
          publishedAt: null,
          estimatedHours: 10,
          progressPercent: 45,
          attachmentsUrl: [],
          externalLink: null,
          notes: "",
          createdAt: "2026-04-01T00:00:00.000Z",
          updatedAt: "2026-04-12T09:30:00.000Z",
        },
      ],
    };
  });

  it("hydrates sort state from URL and syncs URL query params for interactions", async () => {
    const user = userEvent.setup();

    const { rerender } = render(<ExampleEntitiesTable />);

    const searchBox = screen.getByRole("searchbox");
    expect(searchBox).toHaveValue("roadmap");

    expect(
      screen.getByRole("button", {
        name: "Sort by updated ascending",
      }),
    ).toBeInTheDocument();

    fireEvent.change(searchBox, { target: { value: "launch" } });
    rerender(<ExampleEntitiesTable />);

    await waitFor(() => {
      expect(replace).toHaveBeenLastCalledWith(expect.stringContaining("q=launch"));
    });

    const statusFilter = screen.getByRole("combobox", { name: "Filter by status" });
    fireEvent.change(statusFilter, { target: { value: "published" } });
    rerender(<ExampleEntitiesTable />);

    await waitFor(() => {
      expect(replace).toHaveBeenLastCalledWith(expect.stringContaining("f_status=published"));
    });

    await user.click(screen.getByRole("button", { name: "Sort by updated ascending" }));

    await waitFor(() => {
      expect(replace).toHaveBeenLastCalledWith(
        "/dashboard/example-entities?page=1&size=10&q=launch&f_status=published",
      );
    });

    rerender(<ExampleEntitiesTable />);

    await user.click(screen.getByRole("button", { name: "Sort by updated ascending" }));
    rerender(<ExampleEntitiesTable />);

    await waitFor(() => {
      expect(replace).toHaveBeenLastCalledWith(
        expect.stringContaining("sort=updatedAt.asc"),
      );
    });

  });

  it("syncs sort state when URL params change", async () => {
    const { rerender } = render(<ExampleEntitiesTable />);

    expect(
      screen.getByRole("button", {
        name: "Sort by updated ascending",
      }),
    ).toBeInTheDocument();

    searchParamsValue = "q=roadmap&sort=title.asc&f_status=draft";
    searchParamsState = new URLSearchParams(searchParamsValue);

    rerender(<ExampleEntitiesTable />);

    expect(
      screen.getByRole("button", {
        name: "Sort by title descending",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Sort by updated ascending",
      }),
    ).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Sort by title descending" }));

    await waitFor(() => {
      expect(replace).toHaveBeenLastCalledWith(
        expect.stringContaining("sort=title.desc"),
      );
    });

    expect(replace).toHaveBeenLastCalledWith(
      expect.stringContaining("q=roadmap"),
    );
    expect(replace).toHaveBeenLastCalledWith(
      expect.stringContaining("f_status=draft"),
    );
  });

  it("syncs URL query params for search and filter interactions", async () => {
    const { rerender } = render(<ExampleEntitiesTable />);

    const searchBox = screen.getByRole("searchbox");
    fireEvent.change(searchBox, { target: { value: "launch" } });
    rerender(<ExampleEntitiesTable />);

    await waitFor(() => {
      expect(replace).toHaveBeenLastCalledWith(expect.stringContaining("q=launch"));
    });

    const statusFilter = screen.getByRole("combobox", { name: "Filter by status" });
    fireEvent.change(statusFilter, { target: { value: "published" } });
    rerender(<ExampleEntitiesTable />);

    await waitFor(() => {
      expect(replace).toHaveBeenLastCalledWith(expect.stringContaining("f_status=published"));
    });
  });

  it("renders search placeholder and richer table columns", () => {
    render(<ExampleEntitiesTable />);

    expect(screen.getByPlaceholderText("Search by title, owner, or status")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Status" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Priority" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Owner" })).toBeInTheDocument();
  });

  it("renders status filter with all statuses option", () => {
    render(<ExampleEntitiesTable />);

    expect(screen.getByText("Filter by status")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "All statuses" })).toBeInTheDocument();
  });

  it("renders Ctrl+K keyboard hint in search input", () => {
    render(<ExampleEntitiesTable />);

    expect(screen.getAllByText("Ctrl").length).toBeGreaterThan(0);
    expect(screen.getAllByText("K").length).toBeGreaterThan(0);
  });

  it("supports bulk delete for selected rows", async () => {
    const user = userEvent.setup();
    render(<ExampleEntitiesTable />);

    await user.click(screen.getByRole("checkbox", { name: "Select row 1" }));
    await user.click(screen.getByRole("button", { name: "Delete selected" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Delete example entity?")).toBeInTheDocument();
  });

  it("keeps Ctrl+K keyboard shortcut focus behavior", async () => {
    const user = userEvent.setup();
    render(<ExampleEntitiesTable />);

    await user.keyboard("{Control>}k{/Control}");

    expect(screen.getByRole("searchbox")).toHaveFocus();
  });

  it("keeps CRUD actions for each row", async () => {
    const user = userEvent.setup();

    render(<ExampleEntitiesTable />);

    expect(screen.getAllByRole("link", { name: "View" }).at(0)).toHaveAttribute(
      "href",
      "/dashboard/example-entities/entity-1",
    );
    expect(screen.getAllByRole("link", { name: "Edit" }).at(0)).toHaveAttribute(
      "href",
      "/dashboard/example-entities/entity-1/edit",
    );

    await user.click(screen.getAllByRole("button", { name: "Delete" }).at(0)!);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Delete example entity?")).toBeInTheDocument();
    expect(
      within(dialog).getByText('Are you sure you want to delete "Roadmap 2026"? This action cannot be undone.'),
    ).toBeInTheDocument();
  });
});
