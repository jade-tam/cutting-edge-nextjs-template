import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockProvider = {
  kind: "firebase" as const,
  list: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

vi.mock("@/lib/example-entity/factory", () => ({
  createExampleEntityProvider: () => mockProvider,
}));

function buildValidPayload() {
  return {
    title: "Roadmap",
    body: "Body",
    slug: "roadmap",
    summary: "Roadmap summary",
    status: "draft",
    category: "product",
    tags: ["q2"],
    priority: "medium",
    ownerName: "Jade Tam",
    dueDate: "2026-04-20",
    isFeatured: false,
    publishedAt: null,
    estimatedHours: 8,
    progressPercent: 20,
    attachmentsUrl: ["https://example.com/spec.pdf"],
    externalLink: null,
    notes: "Initial notes",
  };
}

describe("example-entities API validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProvider.create.mockResolvedValue({ id: "entity-1", ...buildValidPayload() });
    mockProvider.update.mockResolvedValue({ id: "entity-1", ...buildValidPayload() });
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("rejects invalid status and progressPercent on create", async () => {
    const { POST } = await import("@/app/api/example-entities/route");

    const response = await POST(
      new Request("http://localhost/api/example-entities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...buildValidPayload(),
          status: "invalid",
          progressPercent: 140,
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "invalid_request" });
    expect(mockProvider.create).not.toHaveBeenCalled();
  });

  it("accepts partial payload on update", async () => {
    const { PATCH } = await import("@/app/api/example-entities/[id]/route");

    const payload = {
      title: "Updated roadmap",
    };

    const response = await PATCH(
      new Request("http://localhost/api/example-entities/entity-1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
      {
        params: Promise.resolve({ id: "entity-1" }),
      },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ id: "entity-1", ...buildValidPayload() });
    expect(mockProvider.update).toHaveBeenCalledWith("entity-1", payload);
  });

  it("rejects invalid rich fields on update", async () => {
    const { PATCH } = await import("@/app/api/example-entities/[id]/route");

    const response = await PATCH(
      new Request("http://localhost/api/example-entities/entity-1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attachmentsUrl: ["not-a-url"],
          estimatedHours: -1,
        }),
      }),
      {
        params: Promise.resolve({ id: "entity-1" }),
      },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "invalid_request" });
    expect(mockProvider.update).not.toHaveBeenCalled();
  });
});
