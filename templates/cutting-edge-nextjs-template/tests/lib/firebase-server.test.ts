import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const connectStorageEmulator = vi.fn();
const getStorage = vi.fn(() => ({ __type: "storage" }));
const getApps = vi.fn(() => []);
const getApp = vi.fn(() => ({ __type: "app" }));
const initializeApp = vi.fn(() => ({ __type: "app" }));

vi.mock("firebase/storage", () => ({ connectStorageEmulator, getStorage }));
vi.mock("firebase/app", () => ({ getApps, getApp, initializeApp }));

function stubServerEnv(useEmulator: "true" | "false") {
  vi.stubEnv("DATA_PROVIDER", "firebase");
  vi.stubEnv("AUTH_COOKIE_NAME", "dashboard_session");
  vi.stubEnv("FIREBASE_API_KEY", "firebase-api-key");
  vi.stubEnv("FIREBASE_AUTH_DOMAIN", "demo.firebaseapp.com");
  vi.stubEnv("FIREBASE_PROJECT_ID", "demo-project");
  vi.stubEnv("FIREBASE_APP_ID", "1:1234567890:web:abcdef");
  vi.stubEnv("USE_FIREBASE_EMULATOR", useEmulator);
  vi.stubEnv("NODE_ENV", "test");
}

describe("firebase server storage", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("connects storage emulator in non-production", async () => {
    stubServerEnv("true");
    const mod = await import("@/lib/firebase/server");
    mod.__resetFirebaseServerForTests();

    mod.getFirebaseStorageServer();

    expect(connectStorageEmulator).toHaveBeenCalledWith(
      expect.any(Object),
      "127.0.0.1",
      9199,
    );
  });
});
