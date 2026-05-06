import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ExampleEntityForm from "@/features/example-entity/components/example-entity-form";

const push = vi.fn();
const createMutateAsync = vi.fn();
const updateMutateAsync = vi.fn();
let createIsPending = false;

vi.mock("cally", () => ({}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "exampleEntity.form.titleCreate": "Create example entity",
      "exampleEntity.form.titleEdit": "Edit example entity",
      "exampleEntity.form.descriptionCreate": "Fill in the fields below to create a new example entity.",
      "exampleEntity.form.descriptionEdit": "Fill in the fields below to update this example entity.",
      "exampleEntity.form.sections.general": "General Information",
      "exampleEntity.form.sections.assignment": "Assignment",
      "exampleEntity.form.sections.metadata": "Metadata",
      "exampleEntity.form.sections.featured": "Highlight",
      "exampleEntity.form.saving": "Saving...",
      "exampleEntity.form.submitCreate": "Create",
      "exampleEntity.form.submitEdit": "Save",
      "exampleEntity.form.fields.title.label": "Title",
      "exampleEntity.form.fields.title.placeholder": "Launch roadmap",
      "exampleEntity.form.fields.slug.label": "Slug",
      "exampleEntity.form.fields.slug.placeholder": "launch-roadmap",
      "exampleEntity.form.fields.summary.label": "Summary",
      "exampleEntity.form.fields.summary.placeholder": "Roadmap summary for Q2 launch",
      "exampleEntity.form.fields.status.label": "Status",
      "exampleEntity.form.fields.status.options.draft": "Draft",
      "exampleEntity.form.fields.status.options.in_review": "In review",
      "exampleEntity.form.fields.status.options.published": "Published",
      "exampleEntity.form.fields.status.options.archived": "Archived",
      "exampleEntity.form.fields.category.label": "Category",
      "exampleEntity.form.fields.category.options.product": "Product",
      "exampleEntity.form.fields.category.options.engineering": "Engineering",
      "exampleEntity.form.fields.category.options.marketing": "Marketing",
      "exampleEntity.form.fields.category.options.operations": "Operations",
      "exampleEntity.form.fields.priority.label": "Priority",
      "exampleEntity.form.fields.priority.options.low": "Low",
      "exampleEntity.form.fields.priority.options.medium": "Medium",
      "exampleEntity.form.fields.priority.options.high": "High",
      "exampleEntity.form.fields.priority.options.urgent": "Urgent",
      "exampleEntity.form.fields.ownerName.label": "Owner name",
      "exampleEntity.form.fields.ownerName.placeholder": "Jane Doe",
      "exampleEntity.form.fields.dueDate.label": "Due date",
      "exampleEntity.form.fields.dueDate.previousMonthLabel": "Previous",
      "exampleEntity.form.fields.dueDate.nextMonthLabel": "Next",
      "exampleEntity.form.fields.isFeatured.label": "Feature on homepage",
      "exampleEntity.form.fields.body.label": "Body",
      "exampleEntity.form.fields.body.placeholder": "Detailed entity content",
      "validation.exampleEntity.title.min": "Title is required",
      "validation.exampleEntity.slug.min": "Slug is required",
      "validation.exampleEntity.summary.min": "Summary is required",
      "validation.exampleEntity.ownerName.min": "Owner name is required",
      "validation.exampleEntity.body.min": "Body is required",
      "toast.exampleEntity.created": "Created",
    };

    return translations[key] ?? key;
  },
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/features/example-entity/hooks/use-create-example-entity", () => ({
  useCreateExampleEntity: () => ({
    mutateAsync: createMutateAsync,
    isPending: createIsPending,
    error: null,
  }),
}));

vi.mock("@/features/example-entity/hooks/use-update-example-entity", () => ({
  useUpdateExampleEntity: () => ({
    mutateAsync: updateMutateAsync,
    isPending: false,
    error: null,
  }),
}));

vi.mock("motion/react", () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: {
    span: ({ children, ...props }: ComponentProps<"span">) => <span {...props}>{children}</span>,
  },
}));

describe("ExampleEntityForm", () => {
  beforeEach(() => {
    createIsPending = false;
    push.mockReset();
    createMutateAsync.mockReset();
    updateMutateAsync.mockReset();
  });

  it("renders all rich fields with labels", () => {
    render(<ExampleEntityForm mode="create" />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/slug/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/summary/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/owner name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/feature on homepage/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/body/i)).toBeInTheDocument();
  });

  it("shows normalized translated validation messages after submit", async () => {
    const user = userEvent.setup();

    const { container } = render(<ExampleEntityForm mode="create" />);

    const activeForm = container.querySelector("form");
    expect(activeForm).toBeTruthy();
    const active = within(activeForm as HTMLElement);

    await user.click(active.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(createMutateAsync).not.toHaveBeenCalled();
      expect(screen.getByText("Title is required")).toBeInTheDocument();
      expect(screen.getByText("Slug is required")).toBeInTheDocument();
    });
  });

  it("submits create payload and navigates to created detail page", async () => {
    const user = userEvent.setup();

    createMutateAsync.mockResolvedValue({
      id: "entity-123",
      title: "New title",
      body: "New body",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    const { container } = render(<ExampleEntityForm mode="create" />);

    const activeForm = container.querySelector("form");
    expect(activeForm).toBeTruthy();
    const active = within(activeForm as HTMLElement);

    await user.type(active.getByRole("textbox", { name: "Title" }), "New title");
    await user.type(active.getByRole("textbox", { name: "Slug" }), "new-title");
    await user.type(active.getByRole("textbox", { name: "Summary" }), "New summary");
    await user.type(active.getByRole("textbox", { name: "Owner name" }), "Jane Doe");
    await user.type(active.getByRole("textbox", { name: "Body" }), "New body");

    await user.click(active.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(createMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New title",
          slug: "new-title",
          summary: "New summary",
          ownerName: "Jane Doe",
          body: "New body",
        }),
      );
      expect(push).toHaveBeenCalledWith("/dashboard/example-entities/entity-123");
    });

    expect(updateMutateAsync).not.toHaveBeenCalled();
  });

  it("disables submit button while create mutation is pending", () => {
    createIsPending = true;

    render(<ExampleEntityForm mode="create" />);

    const submitButton = screen.getByRole("button", { name: "Saving..." });
    expect(submitButton).toBeDisabled();
    expect(createMutateAsync).not.toHaveBeenCalled();
    expect(updateMutateAsync).not.toHaveBeenCalled();
  });

  it("renders sectioned layout in edit mode without duplicate page description", () => {
    const { container } = render(
      <ExampleEntityForm
        mode="edit"
        id="entity-1"
        defaultValues={{
          title: "A",
          slug: "a",
          summary: "S",
          body: "B",
          ownerName: "Owner",
        }}
      />,
    );

    const activeForm = container.querySelector("form");
    expect(activeForm).toBeTruthy();
    const active = within(activeForm as HTMLElement);

    expect(active.getByText("General Information")).toBeInTheDocument();
    expect(active.getByText("Assignment")).toBeInTheDocument();
    expect(active.getByText("Metadata")).toBeInTheDocument();
    expect(active.getByText("Highlight")).toBeInTheDocument();
    expect(
      active.queryByText("Fill in the fields below to update this example entity."),
    ).not.toBeInTheDocument();
    expect(active.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("sets slug as readonly in edit mode", () => {
    const { container } = render(
      <ExampleEntityForm
        mode="edit"
        id="entity-1"
        defaultValues={{
          title: "A",
          slug: "locked-slug",
          summary: "S",
          body: "B",
          ownerName: "Owner",
        }}
      />,
    );

    const activeForm = container.querySelector("form");
    expect(activeForm).toBeTruthy();
    const active = within(activeForm as HTMLElement);

    expect(active.getByRole("textbox", { name: "Slug" })).toHaveAttribute("readonly");
  });

  it("includes due date in submit payload when calendar-date emits change", async () => {
    const user = userEvent.setup();
    createMutateAsync.mockResolvedValue({
      id: "entity-123",
      title: "New title",
      body: "New body",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    const { container } = render(<ExampleEntityForm mode="create" />);
    const activeForm = container.querySelector("form");
    expect(activeForm).toBeTruthy();
    const active = within(activeForm as HTMLElement);

    await user.click(active.getByRole("button", { name: /due date/i }));

    const calendar = activeForm?.querySelector("calendar-date") as HTMLElement & { value?: string };
    expect(calendar).toBeTruthy();
    expect(activeForm?.querySelector('svg[aria-label="Previous"]')).toBeTruthy();
    expect(activeForm?.querySelector('svg[aria-label="Next"]')).toBeTruthy();

    calendar.value = "2026-04-20";
    await act(async () => {
      calendar.dispatchEvent(new Event("change", { bubbles: true }));
    });

    await user.type(active.getByRole("textbox", { name: "Title" }), "New title");
    await user.type(active.getByRole("textbox", { name: "Slug" }), "new-title");
    await user.type(active.getByRole("textbox", { name: "Summary" }), "New summary");
    await user.type(active.getByRole("textbox", { name: "Owner name" }), "Jane Doe");
    await user.type(active.getByRole("textbox", { name: "Body" }), "New body");

    await user.click(active.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(createMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          dueDate: "2026-04-20",
        }),
      );
    });
  });

  it("keeps validation errors visible after submit then blur on empty field", async () => {
    const user = userEvent.setup();

    const { container } = render(<ExampleEntityForm mode="create" />);
    const activeForm = container.querySelector("form");
    expect(activeForm).toBeTruthy();
    const active = within(activeForm as HTMLElement);

    await user.click(active.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(active.getByText("Title is required")).toBeInTheDocument();
    });

    const titleInput = active.getByRole("textbox", { name: "Title" });
    await user.click(titleInput);
    await user.tab();

    expect(active.getByText("Title is required")).toBeInTheDocument();
  });
});
