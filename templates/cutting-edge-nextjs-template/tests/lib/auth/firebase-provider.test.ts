import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function stubFirebaseEnv() {
  vi.stubEnv("DATA_PROVIDER", "firebase");
  vi.stubEnv("AUTH_COOKIE_NAME", "dashboard_session");
  vi.stubEnv("NEXT_PUBLIC_BASE_URL", "http://localhost:3000");
  vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:3001/api");
  vi.stubEnv("FIREBASE_API_KEY", "firebase-api-key");
  vi.stubEnv("FIREBASE_AUTH_DOMAIN", "demo.firebaseapp.com");
  vi.stubEnv("FIREBASE_PROJECT_ID", "demo-project");
  vi.stubEnv("FIREBASE_APP_ID", "1:1234567890:web:abcdef");
  vi.stubEnv("USE_FIREBASE_EMULATOR", "true");
}

const authInstance = { __type: "auth" };
const firestoreInstance = { __type: "firestore" };
const collectionRef = { __type: "users-collection" };
const signInWithEmailAndPassword = vi.fn();
const createUserWithEmailAndPassword = vi.fn();
const sendPasswordResetEmail = vi.fn();
const updateProfile = vi.fn();
const fetchMock = vi.fn();

const doc = vi.fn();
const getDoc = vi.fn();
const setDoc = vi.fn();
const updateDoc = vi.fn();
const query = vi.fn();
const where = vi.fn();
const getDocs = vi.fn();
const collection = vi.fn();
const serverTimestamp = vi.fn(() => "server-timestamp");

const getAuth = vi.fn(() => authInstance);
const getFirestore = vi.fn(() => firestoreInstance);

vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  getAuth,
  connectAuthEmulator: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  collection,
  serverTimestamp,
  getFirestore,
  connectFirestoreEmulator: vi.fn(),
}));

vi.mock("firebase/app", () => ({
  getApps: vi.fn(() => [{ name: "app" }]),
  getApp: vi.fn(() => ({ name: "app" })),
  initializeApp: vi.fn(() => ({ name: "app" })),
}));

vi.mock("firebase/storage", () => ({
  getStorage: vi.fn(() => ({ __type: "storage" })),
  connectStorageEmulator: vi.fn(),
}));

describe("firebase auth provider", () => {
  beforeEach(() => {
    stubFirebaseEnv();
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);

    collection.mockReturnValue(collectionRef);
    doc.mockImplementation((_db, _name, id) => ({ id }));
    query.mockImplementation(() => ({ __type: "query" }));
    where.mockImplementation(() => ({ __type: "where" }));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("login response session includes role", async () => {
    const getIdToken = vi.fn().mockResolvedValueOnce("token-1");

    signInWithEmailAndPassword.mockResolvedValueOnce({
      user: {
        uid: "uid-1",
        email: "user@example.com",
        displayName: "User",
        getIdToken,
      },
    });

    getDoc
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          userId: "uid-1",
          email: "user@example.com",
          role: "user",
          fullName: "User",
          displayName: null,
          username: null,
          avatarUrl: null,
          pronouns: null,
          bio: null,
          lastLoginAt: null,
          isActive: true,
          createdAt: "2026-04-07T00:00:00.000Z",
          updatedAt: "2026-04-07T00:00:00.000Z",
          metadata: null,
        }),
      })
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          userId: "uid-1",
          email: "user@example.com",
          role: "user",
          fullName: "User",
          displayName: null,
          username: null,
          avatarUrl: null,
          pronouns: null,
          bio: null,
          lastLoginAt: null,
          isActive: true,
          createdAt: "2026-04-07T00:00:00.000Z",
          updatedAt: "2026-04-07T00:00:00.000Z",
          metadata: null,
        }),
      })
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          userId: "uid-1",
          email: "user@example.com",
          role: "user",
          fullName: "User",
          displayName: null,
          username: null,
          avatarUrl: null,
          pronouns: null,
          bio: null,
          lastLoginAt: "2026-04-07T00:00:00.000Z",
          isActive: true,
          createdAt: "2026-04-07T00:00:00.000Z",
          updatedAt: "2026-04-07T00:00:00.000Z",
          metadata: null,
        }),
      });

    const { createFirebaseAuthProvider } = await import("@/lib/auth/adapters/firebase");
    const result = await createFirebaseAuthProvider().login({
      email: "user@example.com",
      password: "Password1!",
    });

    expect(result.session.role).toBe("user");
  });

  it("login rejects deactivated users", async () => {
    const getIdToken = vi.fn().mockResolvedValueOnce("token-1");

    signInWithEmailAndPassword.mockResolvedValueOnce({
      user: {
        uid: "uid-1",
        email: "user@example.com",
        displayName: "User",
        getIdToken,
      },
    });

    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        userId: "uid-1",
        email: "user@example.com",
        role: "user",
        fullName: "User",
        displayName: null,
        username: null,
        avatarUrl: null,
        pronouns: null,
        bio: null,
        lastLoginAt: null,
        isActive: false,
        createdAt: "2026-04-07T00:00:00.000Z",
        updatedAt: "2026-04-07T00:00:00.000Z",
        metadata: null,
      }),
    });

    const { createFirebaseAuthProvider } = await import("@/lib/auth/adapters/firebase");

    await expect(
      createFirebaseAuthProvider().login({
        email: "user@example.com",
        password: "Password1!",
      }),
    ).rejects.toMatchObject({ code: "account_deactivated" });
  });

  it("updateUserProfile rejects duplicate username", async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        userId: "uid-1",
        email: "user@example.com",
        role: "user",
        fullName: "User",
        displayName: null,
        username: "old_name",
        avatarUrl: null,
        pronouns: null,
        bio: null,
        lastLoginAt: null,
        isActive: true,
        createdAt: "2026-04-07T00:00:00.000Z",
        updatedAt: "2026-04-07T00:00:00.000Z",
        metadata: null,
      }),
    });

    getDocs.mockResolvedValueOnce({
      docs: [{ id: "uid-2" }],
    });

    const { createFirebaseAuthProvider } = await import("@/lib/auth/adapters/firebase");

    await expect(
      createFirebaseAuthProvider().updateUserProfile("uid-1", { username: "taken_name" }),
    ).rejects.toMatchObject({ code: "username_already_taken" });
  });

  it("register maps firebase duplicate email to email_already_taken", async () => {
    createUserWithEmailAndPassword.mockRejectedValueOnce({
      code: "auth/email-already-in-use",
    });

    const { createFirebaseAuthProvider } = await import("@/lib/auth/adapters/firebase");

    await expect(
      createFirebaseAuthProvider().register({
        fullName: "Ada",
        username: "ada_user",
        email: "ada@example.com",
        password: "Sup3r!SecurePass",
      }),
    ).rejects.toMatchObject({ code: "email_already_taken" });
  });

  it("register rejects duplicate username", async () => {
    const getIdToken = vi.fn().mockResolvedValueOnce("token-1");

    createUserWithEmailAndPassword.mockResolvedValueOnce({
      user: {
        uid: "uid-1",
        email: "user@example.com",
        displayName: "User",
        getIdToken,
      },
    });

    getDoc.mockResolvedValueOnce({
      exists: () => false,
    });

    getDocs.mockResolvedValueOnce({
      docs: [{ id: "uid-2" }],
    });

    const { createFirebaseAuthProvider } = await import("@/lib/auth/adapters/firebase");

    await expect(
      createFirebaseAuthProvider().register({
        fullName: "User",
        username: "taken_name",
        email: "user@example.com",
        password: "Sup3r!SecurePass",
      }),
    ).rejects.toMatchObject({ code: "username_already_taken" });
  });

  it("getSession uses Firebase Auth emulator lookup endpoint by default", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValueOnce({
        users: [{ localId: "uid-1", email: "user@example.com", displayName: "User" }],
      }),
    });

    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        userId: "uid-1",
        email: "user@example.com",
        role: "user",
        fullName: "User",
        displayName: null,
        username: null,
        avatarUrl: null,
        pronouns: null,
        bio: null,
        lastLoginAt: null,
        isActive: true,
        createdAt: "2026-04-07T00:00:00.000Z",
        updatedAt: "2026-04-07T00:00:00.000Z",
        metadata: null,
      }),
    });

    const { createFirebaseAuthProvider } = await import("@/lib/auth/adapters/firebase");

    await expect(createFirebaseAuthProvider().getSession("token-1")).resolves.toEqual({
      userId: "uid-1",
      email: "user@example.com",
      role: "user",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:lookup?key=firebase-api-key",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("getSession returns null for invalid token", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValueOnce({
        error: { message: "INVALID_ID_TOKEN" },
      }),
    });

    const { createFirebaseAuthProvider } = await import("@/lib/auth/adapters/firebase");

    await expect(createFirebaseAuthProvider().getSession("bad-token")).resolves.toBeNull();
  });
});
