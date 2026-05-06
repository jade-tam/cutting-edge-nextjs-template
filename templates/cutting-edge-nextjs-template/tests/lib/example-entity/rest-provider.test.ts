import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();

const richEntityPayload = {
  id: "entity-1",
  title: "Roadmap",
  body: "Roadmap body",
  slug: "roadmap-q3",
  summary: "Q3 roadmap summary",
  status: "draft",
  category: "product",
  tags: ["alpha", "beta"],
  priority: "high",
  ownerName: "Jade",
  dueDate: "2026-07-15",
  isFeatured: true,
  publishedAt: null,
  estimatedHours: 24,
  progressPercent: 45,
  attachmentsUrl: ["https://example.com/a.pdf"],
  externalLink: "https://example.com/roadmap",
  notes: "Needs review",
  createdAt: "2026-04-06T00:00:00.000Z",
  updatedAt: "2026-04-06T00:00:00.000Z",
};

describe("rest example-entity provider", () => {
  beforeEach(() => {
    vi.stubEnv("DATA_PROVIDER", "rest");
    vi.stubEnv("AUTH_COOKIE_NAME", "dashboard_session");
    vi.stubEnv("REST_API_BASE_URL", "http://localhost:3001/api");
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("normalizes rich entity fields from adapter responses", async () => {
    fetchMock.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: vi.fn().mockResolvedValueOnce(richEntityPayload),
    });

    const { createRestExampleEntityProvider } = await import(
      "@/lib/example-entity/adapters/rest"
    );

    const provider = createRestExampleEntityProvider();
    const entity = await provider.get("entity-1");

    expect(entity?.status).toBe("draft");
    expect(entity?.tags).toEqual(["alpha", "beta"]);
    expect(entity?.progressPercent).toBe(45);
    expect(entity?.attachmentsUrl).toContain("https://example.com/a.pdf");
  });

  it("maps create payload fields through to REST API", async () => {
    fetchMock.mockResolvedValueOnce({
      status: 201,
      ok: true,
      json: vi.fn().mockResolvedValueOnce(richEntityPayload),
    });

    const { createRestExampleEntityProvider } = await import(
      "@/lib/example-entity/adapters/rest"
    );

    const provider = createRestExampleEntityProvider();

    await provider.create({
      title: "Roadmap",
      body: "Roadmap body",
      slug: "roadmap-q3",
      summary: "Q3 roadmap summary",
      status: "draft",
      category: "product",
      tags: ["alpha", "beta"],
      priority: "high",
      ownerName: "Jade",
      dueDate: "2026-07-15",
      isFeatured: true,
      publishedAt: null,
      estimatedHours: 24,
      progressPercent: 45,
      attachmentsUrl: ["https://example.com/a.pdf"],
      externalLink: "https://example.com/roadmap",
      notes: "Needs review",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/example-entities",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          title: "Roadmap",
          body: "Roadmap body",
          slug: "roadmap-q3",
          summary: "Q3 roadmap summary",
          status: "draft",
          category: "product",
          tags: ["alpha", "beta"],
          priority: "high",
          ownerName: "Jade",
          dueDate: "2026-07-15",
          isFeatured: true,
          publishedAt: null,
          estimatedHours: 24,
          progressPercent: 45,
          attachmentsUrl: ["https://example.com/a.pdf"],
          externalLink: "https://example.com/roadmap",
          notes: "Needs review",
        }),
      }),
    );
  });
});
