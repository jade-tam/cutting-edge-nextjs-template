import { afterEach, describe, expect, it, vi } from "vitest";

import { ExampleEntityError } from "../../../lib/example-entity/errors";

const validPayload = {
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
};

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



async function loadByIdRouteModule() {
  vi.resetModules();
  return import("../../../app/api/example-entities/[id]/route");
}

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe("example-entities by-id API route", () => {
  it("returns 400 when id param is missing", async () => {
    const route = await loadByIdRouteModule();

    const response = await route.GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "" }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "invalid_request" });
  });

  it("maps firebase not implemented errors to 501", async () => {
    mockProvider.get.mockRejectedValueOnce(new ExampleEntityError("not_implemented"));

    const route = await loadByIdRouteModule();

    const response = await route.GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "entity-1" }),
    });

    expect(response.status).toBe(501);
    await expect(response.json()).resolves.toEqual({ error: "not_implemented" });
  });

  it("maps provider contract errors to 502", async () => {
    mockProvider.update.mockRejectedValueOnce(new ExampleEntityError("contract_error"));

    const route = await loadByIdRouteModule();

    const response = await route.PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify(validPayload),
        headers: { "Content-Type": "application/json" },
      }),
      {
        params: Promise.resolve({ id: "entity-1" }),
      },
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ error: "contract_error" });
  });
});
