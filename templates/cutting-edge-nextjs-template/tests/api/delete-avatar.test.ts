import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockProvider = {
  getSession: vi.fn(),
};

const getSessionTokenFromCookie = vi.fn();
const ref = vi.fn((_storage: unknown, path: string) => ({ path }));
const deleteObject = vi.fn();
const getFirebaseStorageServer = vi.fn(() => ({ __type: "storage" }));

vi.mock("@/lib/auth/session", () => ({
  getSessionTokenFromCookie,
}));

vi.mock("@/lib/auth/factory", () => ({
  createAuthProvider: () => mockProvider,
}));

vi.mock("firebase/storage", () => ({
  ref,
  deleteObject,
}));

vi.mock("@/lib/firebase/server", () => ({
  getFirebaseStorageServer,
}));

describe("delete-avatar API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("returns 403 when origin does not match request host", async () => {
    const { POST } = await import("@/app/api/delete-avatar/route");

    const response = await POST(
      new Request("http://localhost/api/delete-avatar", {
        method: "POST",
        headers: {
          origin: "https://evil.example.com",
          host: "localhost",
        },
        body: JSON.stringify({ path: "uploads/avatars/user-1/a.webp" }),
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "forbidden" });
    expect(getSessionTokenFromCookie).not.toHaveBeenCalled();
  });

  it("returns 401 when session token is missing", async () => {
    getSessionTokenFromCookie.mockResolvedValueOnce(null);

    const { POST } = await import("@/app/api/delete-avatar/route");

    const response = await POST(
      new Request("http://localhost/api/delete-avatar", {
        method: "POST",
        headers: {
          origin: "http://localhost",
          host: "localhost",
        },
        body: JSON.stringify({ path: "uploads/avatars/user-1/a.webp" }),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "unauthorized" });
  });

  it("returns 400 when avatar path is invalid for user", async () => {
    getSessionTokenFromCookie.mockResolvedValueOnce("token-1");
    mockProvider.getSession.mockResolvedValueOnce({
      userId: "user-1",
      email: "user@example.com",
      role: "user",
    });

    const { POST } = await import("@/app/api/delete-avatar/route");

    const response = await POST(
      new Request("http://localhost/api/delete-avatar", {
        method: "POST",
        headers: {
          origin: "http://localhost",
          host: "localhost",
        },
        body: JSON.stringify({ path: "uploads/avatars/user-2/a.webp" }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "invalid_request" });
    expect(deleteObject).not.toHaveBeenCalled();
  });

  it("deletes avatar path for current user", async () => {
    getSessionTokenFromCookie.mockResolvedValueOnce("token-1");
    mockProvider.getSession.mockResolvedValueOnce({
      userId: "user-1",
      email: "user@example.com",
      role: "user",
    });

    const { POST } = await import("@/app/api/delete-avatar/route");

    const response = await POST(
      new Request("http://localhost/api/delete-avatar", {
        method: "POST",
        headers: {
          origin: "http://localhost",
          host: "localhost",
        },
        body: JSON.stringify({ path: "uploads/avatars/user-1/a.webp" }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(getFirebaseStorageServer).toHaveBeenCalledTimes(1);
    expect(ref).toHaveBeenCalledWith({ __type: "storage" }, "uploads/avatars/user-1/a.webp");
    expect(deleteObject).toHaveBeenCalledWith({ path: "uploads/avatars/user-1/a.webp" });
  });

  it("returns 500 when delete fails", async () => {
    getSessionTokenFromCookie.mockResolvedValueOnce("token-1");
    mockProvider.getSession.mockResolvedValueOnce({
      userId: "user-1",
      email: "user@example.com",
      role: "user",
    });
    deleteObject.mockRejectedValueOnce(new Error("failed"));

    const { POST } = await import("@/app/api/delete-avatar/route");

    const response = await POST(
      new Request("http://localhost/api/delete-avatar", {
        method: "POST",
        headers: {
          origin: "http://localhost",
          host: "localhost",
        },
        body: JSON.stringify({ path: "uploads/avatars/user-1/a.webp" }),
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "request_failed" });
  });
});
