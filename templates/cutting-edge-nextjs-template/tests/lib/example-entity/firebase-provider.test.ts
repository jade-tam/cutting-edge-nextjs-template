import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const collection = vi.fn();
const getDocs = vi.fn();
const getDoc = vi.fn();
const addDoc = vi.fn();
const updateDoc = vi.fn();
const deleteDoc = vi.fn();
const doc = vi.fn();

const firestoreInstance = { __type: "firestore" };
const collectionRef = { __type: "collection" };

const richInput = {
  title: "Roadmap",
  body: "Roadmap body",
  slug: "roadmap-q3",
  summary: "Q3 roadmap summary",
  status: "draft" as const,
  category: "product" as const,
  tags: ["alpha", "beta"],
  priority: "high" as const,
  ownerName: "Jade",
  dueDate: "2026-07-15",
  isFeatured: true,
  publishedAt: null,
  estimatedHours: 24,
  progressPercent: 45,
  attachmentsUrl: ["https://example.com/a.pdf"],
  externalLink: "https://example.com/roadmap",
  notes: "Needs review",
};

const getFirestore = vi.fn(() => firestoreInstance);

vi.mock("firebase/firestore", () => ({
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getFirestore,
  connectFirestoreEmulator: vi.fn(),
}));

vi.mock("firebase/app", () => ({
  getApps: vi.fn(() => [{ name: "app" }]),
  getApp: vi.fn(() => ({ name: "app" })),
  initializeApp: vi.fn(() => ({ name: "app" })),
}));

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({ __type: "auth" })),
  connectAuthEmulator: vi.fn(),
}));

vi.mock("firebase/storage", () => ({
  getStorage: vi.fn(() => ({ __type: "storage" })),
  connectStorageEmulator: vi.fn(),
}));

describe("firebase example-entity provider", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });
  beforeEach(() => {
    vi.stubEnv("DATA_PROVIDER", "firebase");
    vi.stubEnv("AUTH_COOKIE_NAME", "dashboard_session");
    vi.stubEnv("FIREBASE_API_KEY", "firebase-api-key");
    vi.stubEnv("FIREBASE_AUTH_DOMAIN", "demo.firebaseapp.com");
    vi.stubEnv("FIREBASE_PROJECT_ID", "demo-project");
    vi.stubEnv("FIREBASE_APP_ID", "1:1234567890:web:abcdef");
    vi.stubEnv("USE_FIREBASE_EMULATOR", "true");
    vi.clearAllMocks();
    collection.mockReturnValue(collectionRef);
    doc.mockImplementation((_db, _name, id) => ({ id }));
  });

  it("list maps firestore docs to entities", async () => {
    getDocs.mockResolvedValueOnce({
      docs: [
        {
          id: "id-1",
          data: () => ({
            ...richInput,
            createdAt: "2026-04-06T00:00:00.000Z",
            updatedAt: "2026-04-06T00:00:00.000Z",
          }),
        },
      ],
    });

    const { createFirebaseExampleEntityProvider } = await import(
      "@/lib/example-entity/adapters/firebase"
    );

    const result = await createFirebaseExampleEntityProvider().list();

    expect(collection).toHaveBeenCalledWith(firestoreInstance, "example-entities");
    expect(result).toEqual([
      {
        id: "id-1",
        ...richInput,
        createdAt: "2026-04-06T00:00:00.000Z",
        updatedAt: "2026-04-06T00:00:00.000Z",
      },
    ]);
  });

  it("get returns mapped entity when doc exists", async () => {
    getDoc.mockResolvedValueOnce({
      id: "id-1",
      exists: () => true,
      data: () => ({
        ...richInput,
        createdAt: "2026-04-06T00:00:00.000Z",
        updatedAt: "2026-04-06T00:00:00.000Z",
      }),
    });

    const { createFirebaseExampleEntityProvider } = await import(
      "@/lib/example-entity/adapters/firebase"
    );

    await expect(createFirebaseExampleEntityProvider().get("id-1")).resolves.toEqual({
      id: "id-1",
      ...richInput,
      createdAt: "2026-04-06T00:00:00.000Z",
      updatedAt: "2026-04-06T00:00:00.000Z",
    });
  });

  it("normalizes rich entity fields from adapter responses", async () => {
    getDoc.mockResolvedValueOnce({
      id: "entity-1",
      exists: () => true,
      data: () => ({
        ...richInput,
        createdAt: "2026-04-06T00:00:00.000Z",
        updatedAt: "2026-04-06T00:00:00.000Z",
      }),
    });

    const { createFirebaseExampleEntityProvider } = await import(
      "@/lib/example-entity/adapters/firebase"
    );

    const entity = await createFirebaseExampleEntityProvider().get("entity-1");

    expect(entity?.status).toBe("draft");
    expect(entity?.tags).toEqual(["alpha", "beta"]);
    expect(entity?.progressPercent).toBe(45);
    expect(entity?.attachmentsUrl).toContain("https://example.com/a.pdf");
  });

  it("get returns null when doc does not exist", async () => {
    getDoc.mockResolvedValueOnce({ exists: () => false });

    const { createFirebaseExampleEntityProvider } = await import(
      "@/lib/example-entity/adapters/firebase"
    );

    await expect(createFirebaseExampleEntityProvider().get("missing")).resolves.toBeNull();
  });

  it("create persists and returns normalized entity", async () => {
    addDoc.mockResolvedValueOnce({ id: "id-new" });

    const { createFirebaseExampleEntityProvider } = await import(
      "@/lib/example-entity/adapters/firebase"
    );

    const result = await createFirebaseExampleEntityProvider().create(richInput);

    expect(addDoc).toHaveBeenCalledWith(
      collectionRef,
      expect.objectContaining(richInput),
    );
    expect(result).toEqual({
      id: "id-new",
      ...richInput,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it("update persists and returns normalized entity", async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        createdAt: "2026-04-01T00:00:00.000Z",
      }),
    });
    updateDoc.mockResolvedValueOnce(undefined);

    const { createFirebaseExampleEntityProvider } = await import(
      "@/lib/example-entity/adapters/firebase"
    );

    const result = await createFirebaseExampleEntityProvider().update("id-1", richInput);

    expect(updateDoc).toHaveBeenCalledWith(
      { id: "id-1" },
      expect.objectContaining(richInput),
    );
    expect(result).toEqual({
      id: "id-1",
      ...richInput,
      createdAt: "2026-04-01T00:00:00.000Z",
      updatedAt: expect.any(String),
    });
  });

  it("remove deletes and returns ok true", async () => {
    getDoc.mockResolvedValueOnce({ exists: () => true });
    deleteDoc.mockResolvedValueOnce(undefined);

    const { createFirebaseExampleEntityProvider } = await import(
      "@/lib/example-entity/adapters/firebase"
    );

    await expect(createFirebaseExampleEntityProvider().remove("id-1")).resolves.toEqual({
      ok: true,
    });
    expect(deleteDoc).toHaveBeenCalledWith({ id: "id-1" });
  });

  it("remove throws not_found when doc missing", async () => {
    getDoc.mockResolvedValueOnce({ exists: () => false });

    const { createFirebaseExampleEntityProvider } = await import(
      "@/lib/example-entity/adapters/firebase"
    );

    await expect(createFirebaseExampleEntityProvider().remove("missing")).rejects.toMatchObject({
      code: "not_found",
    });
  });

  it("maps firestore network-like failures to network_error", async () => {
    getDocs.mockRejectedValueOnce({ code: "firestore/unavailable" });

    const { createFirebaseExampleEntityProvider } = await import(
      "@/lib/example-entity/adapters/firebase"
    );

    await expect(createFirebaseExampleEntityProvider().list()).rejects.toMatchObject({
      code: "network_error",
    });
  });

  it("maps malformed firestore payload to contract_error", async () => {
    getDocs.mockResolvedValueOnce({
      docs: [
        {
          id: "id-1",
          data: () => ({
            title: "Title",
            createdAt: "2026-04-06T00:00:00.000Z",
            updatedAt: "2026-04-06T00:00:00.000Z",
          }),
        },
      ],
    });

    const { createFirebaseExampleEntityProvider } = await import(
      "@/lib/example-entity/adapters/firebase"
    );

    await expect(createFirebaseExampleEntityProvider().list()).rejects.toMatchObject({
      code: "contract_error",
    });
  });
});
