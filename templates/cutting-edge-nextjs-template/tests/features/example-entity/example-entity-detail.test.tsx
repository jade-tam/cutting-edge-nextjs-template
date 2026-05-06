import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ExampleEntityDetail from "@/features/example-entity/components/example-entity-detail";
import type { ExampleEntity } from "@/lib/example-entity/types";

const {
  push,
  mutateAsync,
  toastSuccess,
  toastError,
} = vi.hoisted(() => ({
  push: vi.fn(),
  mutateAsync: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

let detailQueryState: {
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  data: ExampleEntity | undefined;
} = {
  isPending: false,
  isError: false,
  error: null,
  data: undefined,
};

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, string | number>) => {
    const translations: Record<string, string> = {
      "exampleEntity.detail.loading": "Loading example entity...",
      "exampleEntity.detail.notFound": "Example entity not found.",
      "exampleEntity.detail.actions.back": "Back",
      "exampleEntity.detail.actions.edit": "Edit",
      "exampleEntity.detail.actions.delete": "Delete",
      "exampleEntity.detail.actions.deleting": "Deleting...",
      "exampleEntity.detail.featured": "Featured",
      "exampleEntity.detail.owner": "Owner",
      "exampleEntity.detail.slug": "Slug",
      "exampleEntity.detail.progressPercent": "Progress",
      "exampleEntity.detail.estimatedHours": "Estimated hours",
      "exampleEntity.detail.createdAt": "Created",
      "exampleEntity.detail.updatedAtLabel": "Updated",
      "exampleEntity.detail.dueDate": "Due date",
      "exampleEntity.detail.publishedAt": "Published at",
      "exampleEntity.detail.tags": "Tags",
      "exampleEntity.detail.bodyLabel": "Body",
      "exampleEntity.detail.notes": "Notes",
      "exampleEntity.detail.externalLink": "External link",
      "exampleEntity.detail.attachments": "Attachments",
      "exampleEntity.detail.emptyValue": "-",
      "exampleEntity.detail.noTags": "No tags",
      "exampleEntity.detail.noNotes": "No notes",
      "exampleEntity.detail.noExternalLink": "No external link",
      "exampleEntity.detail.noAttachments": "No attachments",
      "exampleEntity.detail.deleteModal.title": "Delete example entity?",
      "exampleEntity.detail.deleteModal.description": "Are you sure you want to delete \"{title}\"? This action cannot be undone.",
      "exampleEntity.detail.deleteModal.cancel": "Cancel",
      "exampleEntity.detail.deleteModal.confirm": "Delete",
      "exampleEntity.detail.deleteModal.deleting": "Deleting...",
      "exampleEntity.detail.deleteModal.close": "Close modal",
      "exampleEntity.form.fields.status.options.draft": "Draft",
      "exampleEntity.form.fields.priority.options.high": "High",
      "exampleEntity.form.fields.category.options.product": "Product",
      "toast.exampleEntity.deleted": "Deleted",
      "toast.exampleEntity.deleteFailed": "Unable to delete example entity.",
      "toast.exampleEntity.loadFailed": "Unable to load example entity.",
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

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push }),
  Link: ({ href, className, children }: { href: string; className?: string; children: ReactNode }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("@/features/example-entity/hooks/use-example-entity", () => ({
  useExampleEntity: () => detailQueryState,
}));

vi.mock("@/features/example-entity/hooks/use-delete-example-entity", () => ({
  useDeleteExampleEntity: () => ({
    isPending: false,
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

describe("ExampleEntityDetail", () => {
  beforeEach(() => {
    cleanup();
    push.mockReset();
    mutateAsync.mockReset();
    toastSuccess.mockReset();
    toastError.mockReset();

    detailQueryState = {
      isPending: false,
      isError: false,
      error: null,
      data: {
        id: "entity-1",
        title: "Roadmap 2026",
        body: "Roadmap body",
        slug: "roadmap-2026",
        summary: "Roadmap summary",
        status: "draft",
        category: "product",
        tags: ["roadmap", "q2"],
        priority: "high",
        ownerName: "Jane Doe",
        dueDate: "2026-06-01T00:00:00.000Z",
        isFeatured: true,
        publishedAt: null,
        estimatedHours: 10,
        progressPercent: 45,
        attachmentsUrl: ["https://example.com/spec.pdf"],
        externalLink: "https://example.com/project",
        notes: "Launch notes",
        createdAt: "2026-04-01T00:00:00.000Z",
        updatedAt: "2026-04-12T09:30:00.000Z",
      },
    };
  });

  it("renders rich detail sections and metadata", () => {
    render(<ExampleEntityDetail id="entity-1" />);

    expect(screen.getByText("Roadmap 2026")).toBeInTheDocument();
    expect(screen.getByText("Roadmap summary")).toBeInTheDocument();
    expect(screen.getByText("Owner")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Slug")).toBeInTheDocument();
    expect(screen.getByText("roadmap-2026")).toBeInTheDocument();
    expect(screen.getByText("Featured")).toBeInTheDocument();
    expect(screen.getByText("Tags")).toBeInTheDocument();
    expect(screen.getByText("roadmap")).toBeInTheDocument();
    expect(screen.getByText("q2")).toBeInTheDocument();
    expect(screen.getByText("External link")).toBeInTheDocument();
    expect(screen.getByText("https://example.com/project")).toBeInTheDocument();
    expect(screen.getByText("https://example.com/spec.pdf")).toBeInTheDocument();
  });

  it("opens delete modal and confirms delete", async () => {
    const user = userEvent.setup();
    mutateAsync.mockResolvedValue(undefined);

    render(<ExampleEntityDetail id="entity-1" />);

    await user.click(screen.getAllByRole("button", { name: "Delete" })[0]!);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Delete example entity?")).toBeInTheDocument();
    expect(
      screen.getByText('Are you sure you want to delete "Roadmap 2026"? This action cannot be undone.'),
    ).toBeInTheDocument();

    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith("entity-1");
    });
    expect(toastSuccess).toHaveBeenCalledWith("Deleted");
    expect(push).toHaveBeenCalledWith("/dashboard/example-entities");
  });
});
