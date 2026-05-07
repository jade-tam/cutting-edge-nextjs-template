import { describe, expect, it } from "vitest";

import { exampleEntitySchema } from "../../../features/example-entity/schemas/entity-schema";

const basePayload = {
  title: "Roadmap 2026",
  body: "Detailed body",
  slug: "roadmap-2026",
  summary: "Q2 roadmap",
  status: "draft",
  category: "product",
  tags: ["q2", "launch"],
  priority: "medium",
  ownerName: "Jane Doe",
  dueDate: null,
  isFeatured: false,
  publishedAt: null,
  estimatedHours: null,
  progressPercent: 0,
  attachmentsUrl: [],
  externalLink: null,
  notes: "",
} as const;

describe("example entity schema", () => {
  it("requires title", () => {
    const parsed = exampleEntitySchema.safeParse({ ...basePayload, title: "" });
    expect(parsed.success).toBe(false);
  });

  it("requires body", () => {
    const parsed = exampleEntitySchema.safeParse({ ...basePayload, body: "" });
    expect(parsed.success).toBe(false);
  });

  it("enforces title max length", () => {
    const parsed = exampleEntitySchema.safeParse({
      ...basePayload,
      title: "a".repeat(121),
    });
    expect(parsed.success).toBe(false);
  });

  it("enforces body max length", () => {
    const parsed = exampleEntitySchema.safeParse({
      ...basePayload,
      body: "a".repeat(5001),
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts valid payload", () => {
    const parsed = exampleEntitySchema.safeParse(basePayload);
    expect(parsed.success).toBe(true);
  });
});
