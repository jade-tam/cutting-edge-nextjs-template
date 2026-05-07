import { beforeEach, describe, expect, it, vi } from "vitest";

const uploadBytes = vi.fn();
const getDownloadURL = vi.fn();
const ref = vi.fn((storage: unknown, path: string) => ({ storage, path }));
const getFirebaseStorageServer = vi.fn(() => ({ __type: "storage" }));

vi.mock("firebase/storage", () => ({
  getDownloadURL,
  ref,
  uploadBytes,
}));

vi.mock("@/lib/firebase/server", () => ({
  getFirebaseStorageServer,
}));

describe("upload-image", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T10:20:30.000Z"));
    vi.spyOn(crypto, "randomUUID").mockReturnValue("abc12345-dead-beef-cafe-1234567890ff");

    getDownloadURL.mockResolvedValue(
      "https://firebasestorage.googleapis.com/v0/b/demo/o/uploads%2Favatars%2Fuser-1%2Fa.webp?alt=media",
    );
  });

  it("creates uploads path with category and entity", async () => {
    const { uploadImage } = await import("@/lib/storage/upload-image");

    const result = await uploadImage({
      file: new File(["x"], "avatar.webp", { type: "image/webp" }),
      category: "avatars",
      entityId: "user-1",
      extension: "webp",
    });

    expect(result.path).toMatch(/^uploads\/avatars\/user-1\//);
    expect(result.path).toMatch(/-abc12345\.webp$/);
    expect(result.url).toContain("http");

    expect(ref).toHaveBeenCalledWith({ __type: "storage" }, result.path);
    expect(uploadBytes).toHaveBeenCalledWith(
      {
        path: result.path,
        storage: { __type: "storage" },
      },
      expect.any(File),
      {
        cacheControl: "public,max-age=31536000,immutable",
        contentType: "image/webp",
      },
    );
  });

  it("uses image/png contentType for png extension", async () => {
    const { uploadImage } = await import("@/lib/storage/upload-image");

    const result = await uploadImage({
      file: new File(["x"], "avatar.png", { type: "image/png" }),
      category: "avatars",
      entityId: "user-1",
      extension: "png",
    });

    expect(uploadBytes).toHaveBeenCalledWith(
      {
        path: result.path,
        storage: { __type: "storage" },
      },
      expect.any(File),
      {
        cacheControl: "public,max-age=31536000,immutable",
        contentType: "image/png",
      },
    );
  });
});

