import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("firebase/firestore", () => ({
  connectFirestoreEmulator: vi.fn(),
  getFirestore: vi.fn(() => ({ __type: "firestore" })),
  collection: vi.fn(() => ({ __type: "collection" })),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
}));

vi.mock("firebase/app", () => ({
  getApps: vi.fn(() => []),
  getApp: vi.fn(),
  initializeApp: vi.fn(() => ({ __type: "app" })),
}));

async function loadFactoryModule() {
  vi.resetModules();
  return import("../../../lib/example-entity/factory");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("example-entity factory", () => {
  it("returns rest provider when DATA_PROVIDER=rest", async () => {
    vi.stubEnv("DATA_PROVIDER", "rest");
    vi.stubEnv("AUTH_COOKIE_NAME", "dashboard_session");
    vi.stubEnv("REST_API_BASE_URL", "http://localhost:3001/api");

    const { createExampleEntityProvider } = await loadFactoryModule();

    expect(createExampleEntityProvider().kind).toBe("rest");
  });

  it("returns firebase provider when DATA_PROVIDER=firebase", async () => {
    vi.stubEnv("DATA_PROVIDER", "firebase");
    vi.stubEnv("AUTH_COOKIE_NAME", "dashboard_session");
    vi.stubEnv("FIREBASE_API_KEY", "firebase-api-key");
    vi.stubEnv("FIREBASE_AUTH_DOMAIN", "demo.firebaseapp.com");
    vi.stubEnv("FIREBASE_PROJECT_ID", "demo-project");
    vi.stubEnv("FIREBASE_APP_ID", "1:1234567890:web:abcdef");

    const { createExampleEntityProvider } = await loadFactoryModule();

    expect(createExampleEntityProvider().kind).toBe("firebase");
  });

  it("imports firebase provider through factory with contract methods", async () => {
    vi.stubEnv("DATA_PROVIDER", "firebase");
    vi.stubEnv("AUTH_COOKIE_NAME", "dashboard_session");
    vi.stubEnv("FIREBASE_API_KEY", "firebase-api-key");
    vi.stubEnv("FIREBASE_AUTH_DOMAIN", "demo.firebaseapp.com");
    vi.stubEnv("FIREBASE_PROJECT_ID", "demo-project");
    vi.stubEnv("FIREBASE_APP_ID", "1:1234567890:web:abcdef");

    const { createExampleEntityProvider } = await loadFactoryModule();
    const provider = createExampleEntityProvider();

    expect(provider.list).toBeTypeOf("function");
    expect(provider.get).toBeTypeOf("function");
    expect(provider.create).toBeTypeOf("function");
    expect(provider.update).toBeTypeOf("function");
    expect(provider.remove).toBeTypeOf("function");
  });
});
