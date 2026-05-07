import { afterEach, describe, expect, it, vi } from "vitest";
import type { ExampleEntityInput } from "@/lib/example-entity/types";

const exampleEntityInput: ExampleEntityInput = {
  title: "t",
  body: "b",
  slug: "test-slug",
  summary: "summary",
  status: "draft",
  category: "product",
  tags: [],
  priority: "medium",
  ownerName: "owner",
  dueDate: null,
  isFeatured: false,
  publishedAt: null,
  estimatedHours: null,
  progressPercent: 0,
  attachmentsUrl: [],
  externalLink: null,
  notes: "",
};

async function loadRestProviderModule() {
  vi.resetModules();
  return import("../../../lib/example-entity/adapters/rest");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("rest example-entity provider error translation", () => {
  it("maps network failures to network_error", async () => {
    vi.stubEnv("DATA_PROVIDER", "rest");
    vi.stubEnv("AUTH_COOKIE_NAME", "dashboard_session");
    vi.stubEnv("REST_API_BASE_URL", "http://localhost:3001/api");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("boom")));

    const { createRestExampleEntityProvider } = await loadRestProviderModule();
    const provider = createRestExampleEntityProvider();

    await expect(provider.list()).rejects.toMatchObject({
      name: "ExampleEntityError",
      code: "network_error",
    });
  });

  it("maps 404 update responses to not_found", async () => {
    vi.stubEnv("DATA_PROVIDER", "rest");
    vi.stubEnv("AUTH_COOKIE_NAME", "dashboard_session");
    vi.stubEnv("REST_API_BASE_URL", "http://localhost:3001/api");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 404 })),
    );

    const { createRestExampleEntityProvider } = await loadRestProviderModule();
    const provider = createRestExampleEntityProvider();

    await expect(
      provider.update("id-1", exampleEntityInput),
    ).rejects.toMatchObject({
      name: "ExampleEntityError",
      code: "not_found",
    });
  });

  it("maps 400 create responses to client_error", async () => {
    vi.stubEnv("DATA_PROVIDER", "rest");
    vi.stubEnv("AUTH_COOKIE_NAME", "dashboard_session");
    vi.stubEnv("REST_API_BASE_URL", "http://localhost:3001/api");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 400 })),
    );

    const { createRestExampleEntityProvider } = await loadRestProviderModule();
    const provider = createRestExampleEntityProvider();

    await expect(provider.create(exampleEntityInput)).rejects.toMatchObject({
      name: "ExampleEntityError",
      code: "client_error",
    });
  });

  it("maps malformed upstream payload to contract_error", async () => {
    vi.stubEnv("DATA_PROVIDER", "rest");
    vi.stubEnv("AUTH_COOKIE_NAME", "dashboard_session");
    vi.stubEnv("REST_API_BASE_URL", "http://localhost:3001/api");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ wrong: "shape" }), { status: 200 }),
      ),
    );

    const { createRestExampleEntityProvider } = await loadRestProviderModule();
    const provider = createRestExampleEntityProvider();

    await expect(provider.create(exampleEntityInput)).rejects.toMatchObject({
      name: "ExampleEntityError",
      code: "contract_error",
    });
  });
});
