import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, userEvent, within } from "storybook/test";

import ExampleEntityForm from "@/features/example-entity/components/example-entity-form";
import type { ExampleEntity } from "@/lib/example-entity/types";

const meta = {
  title: "Features/ExampleEntity/ExampleEntityForm",
  component: ExampleEntityForm,
  parameters: {
    layout: "padded",
    nextIntl: {
      locale: "en",
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ExampleEntityForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockEntity: ExampleEntity = {
  id: "entity_1",
  title: "Launch roadmap",
  body: "Detailed launch roadmap content for stakeholders.",
  slug: "launch-roadmap",
  summary: "Roadmap summary for Q2 launch",
  status: "in_review",
  category: "product",
  tags: ["roadmap", "q2"],
  priority: "high",
  ownerName: "Jane Doe",
  dueDate: "2026-05-01",
  isFeatured: true,
  publishedAt: null,
  estimatedHours: 16,
  progressPercent: 50,
  attachmentsUrl: [],
  externalLink: null,
  notes: "Keep stakeholders aligned weekly.",
  createdAt: "2026-04-01T00:00:00.000Z",
  updatedAt: "2026-04-02T00:00:00.000Z",
};

export const Create: Story = {
  args: {
    mode: "create",
  },
};

export const Edit: Story = {
  args: {
    mode: "edit",
    id: mockEntity.id,
    defaultValues: {
      title: mockEntity.title,
      body: mockEntity.body,
      slug: mockEntity.slug,
      summary: mockEntity.summary,
      status: mockEntity.status,
      category: mockEntity.category,
      tags: mockEntity.tags,
      priority: mockEntity.priority,
      ownerName: mockEntity.ownerName,
      dueDate: mockEntity.dueDate,
      isFeatured: mockEntity.isFeatured,
      publishedAt: mockEntity.publishedAt,
      estimatedHours: mockEntity.estimatedHours,
      progressPercent: mockEntity.progressPercent,
      attachmentsUrl: mockEntity.attachmentsUrl,
      externalLink: mockEntity.externalLink,
      notes: mockEntity.notes,
    },
  },
};

export const Submitting: Story = {
  args: {
    mode: "create",
  },
  play: async ({ canvasElement }) => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (() => new Promise(() => undefined)) as typeof fetch;

    try {
      const canvas = within(canvasElement);
      await userEvent.type(canvas.getByLabelText("Title"), "Launch roadmap");
      await userEvent.type(
        canvas.getByLabelText("Body"),
        "Detailed launch roadmap content for stakeholders.",
      );
      await userEvent.type(canvas.getByLabelText("Slug"), "launch-roadmap");
      await userEvent.type(canvas.getByLabelText("Summary"), "Roadmap summary for Q2 launch");
      await userEvent.type(canvas.getByLabelText("Owner name"), "Jane Doe");
      await userEvent.click(canvas.getByRole("button", { name: "Create" }));

      await expect(canvas.getByRole("button", { name: "Saving..." })).toBeDisabled();
    } finally {
      globalThis.fetch = originalFetch;
    }
  },
};
