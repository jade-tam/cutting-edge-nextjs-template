import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();

describe("rest auth provider", () => {
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

  it("parses role from rest auth/session response", async () => {
    fetchMock.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: vi.fn().mockResolvedValueOnce({
        userId: "uid-1",
        email: "user@example.com",
        role: "user",
      }),
    });

    const { createRestAuthProvider } = await import("@/lib/auth/adapters/rest");
    const session = await createRestAuthProvider().getSession("token");

    expect(session?.role).toBe("user");
  });
});
