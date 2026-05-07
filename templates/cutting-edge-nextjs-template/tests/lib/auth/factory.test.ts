import { afterEach, describe, expect, it, vi } from "vitest";

async function loadFactoryModule() {
  vi.resetModules();
  return import("../../../lib/auth/factory");
}

function stubFirebaseEnv() {
  vi.stubEnv("DATA_PROVIDER", "firebase");
  vi.stubEnv("AUTH_COOKIE_NAME", "dashboard_session");
  vi.stubEnv("NEXT_PUBLIC_BASE_URL", "http://localhost:3000");
  vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:3001/api");
  vi.stubEnv("FIREBASE_API_KEY", "firebase-api-key");
  vi.stubEnv("FIREBASE_AUTH_DOMAIN", "demo.firebaseapp.com");
  vi.stubEnv("FIREBASE_PROJECT_ID", "demo-project");
  vi.stubEnv("FIREBASE_APP_ID", "1:1234567890:web:abcdef");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("auth factory", () => {
  it("returns rest adapter when DATA_PROVIDER=rest", async () => {
    vi.stubEnv("DATA_PROVIDER", "rest");
    vi.stubEnv("AUTH_COOKIE_NAME", "dashboard_session");
    vi.stubEnv("REST_API_BASE_URL", "http://localhost:3001/api");

    const { createAuthProvider } = await loadFactoryModule();

    expect(createAuthProvider().kind).toBe("rest");
  });

  it("returns firebase adapter when DATA_PROVIDER=firebase", async () => {
    stubFirebaseEnv();

    const { createAuthProvider } = await loadFactoryModule();

    expect(createAuthProvider().kind).toBe("firebase");
  });

  it("imports firebase adapter through factory with auth contract methods", async () => {
    stubFirebaseEnv();

    const { createAuthProvider } = await loadFactoryModule();
    const provider = createAuthProvider();

    expect(provider.login).toBeTypeOf("function");
    expect(provider.register).toBeTypeOf("function");
    expect(provider.forgotPassword).toBeTypeOf("function");
    expect(provider.getSession).toBeTypeOf("function");
    expect(provider.createUserProfile).toBeTypeOf("function");
    expect(provider.getUserProfile).toBeTypeOf("function");
    expect(provider.updateUserProfile).toBeTypeOf("function");
  });

  it("returns null for invalid firebase session token", async () => {
    stubFirebaseEnv();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValueOnce({
          error: { message: "INVALID_ID_TOKEN" },
        }),
      }),
    );

    const { createAuthProvider } = await loadFactoryModule();
    const provider = createAuthProvider();

    await expect(provider.getSession("token")).resolves.toBeNull();
  });
});
