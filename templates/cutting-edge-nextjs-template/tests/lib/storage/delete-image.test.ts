import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();

const successfulResponse = {
  ok: true,
  json: async () => ({ ok: true }),
} as Response;

const failedResponse = {
  ok: false,
  json: async () => ({ error: "request_failed" }),
} as Response;

const malformedFailedResponse = {
  ok: false,
  json: async () => null,
} as Response;

beforeAll(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(successfulResponse);
});

describe("delete-image", () => {
  it("extracts storage path from download URL", async () => {
    const { extractStoragePathFromUrl } = await import("@/lib/storage/delete-image");

    const path = extractStoragePathFromUrl(
      "https://firebasestorage.googleapis.com/v0/b/demo/o/uploads%2Favatars%2Fu1%2Fa.webp?alt=media",
    );

    expect(path).toBe("uploads/avatars/u1/a.webp");
  });

  it("returns null when URL does not include storage object marker", async () => {
    const { extractStoragePathFromUrl } = await import("@/lib/storage/delete-image");

    expect(extractStoragePathFromUrl("https://example.com/avatar.webp")).toBeNull();
  });

  it("returns null when URL cannot be decoded", async () => {
    const { extractStoragePathFromUrl } = await import("@/lib/storage/delete-image");

    expect(
      extractStoragePathFromUrl("https://firebasestorage.googleapis.com/v0/b/demo/o/%E0%A4%A?alt=media"),
    ).toBeNull();
  });

  it("deletes image by storage path", async () => {
    const { deleteImageByPath } = await import("@/lib/storage/delete-image");

    await deleteImageByPath("uploads/avatars/u1/a.webp");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/delete-avatar",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      }),
    );
  });

  it("throws returned API error code for failed deletion", async () => {
    const { deleteImageByPath } = await import("@/lib/storage/delete-image");

    fetchMock.mockResolvedValueOnce(failedResponse);

    await expect(deleteImageByPath("uploads/avatars/u1/a.webp")).rejects.toThrow("request_failed");
  });

  it("throws request_failed when API error payload is malformed", async () => {
    const { deleteImageByPath } = await import("@/lib/storage/delete-image");

    fetchMock.mockResolvedValueOnce(malformedFailedResponse);

    await expect(deleteImageByPath("uploads/avatars/u1/a.webp")).rejects.toThrow("request_failed");
  });
});
