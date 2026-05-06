import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockProvider = {
  getSession: vi.fn(),
};

const getSessionTokenFromCookie = vi.fn();
const uploadImage = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  getSessionTokenFromCookie,
}));

vi.mock("@/lib/auth/factory", () => ({
  createAuthProvider: () => mockProvider,
}));

vi.mock("@/lib/storage/upload-image", () => ({
  uploadImage,
}));

describe("upload-avatar API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("returns 403 when origin does not match request host", async () => {
    const { POST } = await import("@/app/api/upload-avatar/route");

    const request = new Request("http://localhost/api/upload-avatar", {
      method: "POST",
      headers: {
        origin: "https://evil.example.com",
        host: "localhost",
      },
      body: new FormData(),
    });

    const response = await POST(request);

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "forbidden" });
    expect(getSessionTokenFromCookie).not.toHaveBeenCalled();
  });

  it("returns 401 when session token is missing", async () => {
    getSessionTokenFromCookie.mockResolvedValueOnce(null);

    const { POST } = await import("@/app/api/upload-avatar/route");

    const response = await POST(
      new Request("http://localhost/api/upload-avatar", {
        method: "POST",
        headers: {
          origin: "http://localhost",
          host: "localhost",
        },
        body: new FormData(),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "unauthorized" });
    expect(mockProvider.getSession).not.toHaveBeenCalled();
  });

  it("returns 400 for unsupported file type", async () => {
    getSessionTokenFromCookie.mockResolvedValueOnce("token-1");
    mockProvider.getSession.mockResolvedValueOnce({
      userId: "user-1",
      email: "user@example.com",
      role: "user",
    });

    const formData = new FormData();
    formData.append(
      "file",
      new File(["text"], "note.txt", { type: "text/plain" }),
    );

    const { POST } = await import("@/app/api/upload-avatar/route");

    const request = {
      headers: new Headers({
        origin: "http://localhost",
        host: "localhost",
      }),
      formData: vi.fn().mockResolvedValue(formData),
    } as unknown as Request;

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "invalid_file_type" });
    expect(uploadImage).not.toHaveBeenCalled();
  });

  it("returns 400 when file is too large", async () => {
    getSessionTokenFromCookie.mockResolvedValueOnce("token-1");
    mockProvider.getSession.mockResolvedValueOnce({
      userId: "user-1",
      email: "user@example.com",
      role: "user",
    });

    const formData = new FormData();
    formData.append(
      "file",
      new File([new Uint8Array(10 * 1024 * 1024 + 1)], "avatar.png", {
        type: "image/png",
      }),
    );

    const { POST } = await import("@/app/api/upload-avatar/route");

    const request = {
      headers: new Headers({
        origin: "http://localhost",
        host: "localhost",
      }),
      formData: vi.fn().mockResolvedValue(formData),
    } as unknown as Request;

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "file_too_large" });
    expect(uploadImage).not.toHaveBeenCalled();
  });

  it("returns uploaded avatar url and path", async () => {
    getSessionTokenFromCookie.mockResolvedValueOnce("token-1");
    mockProvider.getSession.mockResolvedValueOnce({
      userId: "user-1",
      email: "user@example.com",
      role: "user",
    });

    const file = new File(["image"], "avatar.png", { type: "image/png" });

    uploadImage.mockResolvedValueOnce({
      url: "https://example.com/avatar.webp",
      path: "uploads/avatars/user-1/avatar.webp",
    });

    const formData = new FormData();
    formData.append("file", file);

    const { POST } = await import("@/app/api/upload-avatar/route");

    const request = {
      headers: new Headers({
        origin: "http://localhost",
        host: "localhost",
      }),
      formData: vi.fn().mockResolvedValue(formData),
    } as unknown as Request;

    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      url: "https://example.com/avatar.webp",
      path: "uploads/avatars/user-1/avatar.webp",
    });

    expect(uploadImage).toHaveBeenCalledWith({
      file,
      category: "avatars",
      entityId: "user-1",
      extension: "png",
    });
  });

  it.each([
    "storage/unauthorized",
    "permission_denied",
    "auth/insufficient-permission",
  ])("returns 401 for permission-related upload error code %s", async (code) => {
    getSessionTokenFromCookie.mockResolvedValueOnce("token-1");
    mockProvider.getSession.mockResolvedValueOnce({
      userId: "user-1",
      email: "user@example.com",
      role: "user",
    });

    uploadImage.mockRejectedValueOnce({ code });

    const formData = new FormData();
    formData.append(
      "file",
      new File(["image"], "avatar.png", { type: "image/png" }),
    );

    const { POST } = await import("@/app/api/upload-avatar/route");

    const request = {
      headers: new Headers({
        origin: "http://localhost",
        host: "localhost",
      }),
      formData: vi.fn().mockResolvedValue(formData),
    } as unknown as Request;

    const response = await POST(request);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "unauthorized" });
  });

  it("returns 500 when upload fails", async () => {
    getSessionTokenFromCookie.mockResolvedValueOnce("token-1");
    mockProvider.getSession.mockResolvedValueOnce({
      userId: "user-1",
      email: "user@example.com",
      role: "user",
    });

    uploadImage.mockRejectedValueOnce(new Error("failed"));

    const formData = new FormData();
    formData.append(
      "file",
      new File(["image"], "avatar.png", { type: "image/png" }),
    );

    const { POST } = await import("@/app/api/upload-avatar/route");

    const request = {
      headers: new Headers({
        origin: "http://localhost",
        host: "localhost",
      }),
      formData: vi.fn().mockResolvedValue(formData),
    } as unknown as Request;

    const response = await POST(request);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "upload_failed" });
  });
});
