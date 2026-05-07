import { beforeEach, describe, expect, it, vi } from "vitest";

import { optimizeImageForAvatar } from "@/lib/storage/optimize-image";

type CanvasSetupOptions = {
  contextAvailable?: boolean;
  blobs?: Array<Blob | null>;
};

let mockImageWidth = 1024;
let mockImageHeight = 1024;

function setupCanvasMock(options: CanvasSetupOptions = {}) {
  const { contextAvailable = true, blobs = [new Blob(["webp"], { type: "image/webp" })] } =
    options;

  const drawImage = vi.fn();
  const toBlob = vi.fn((callback: BlobCallback) => {
    callback(blobs.shift() ?? null);
  });

  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => {
      if (!contextAvailable) {
        return null;
      }

      return {
        drawImage,
      };
    }),
    toBlob,
  } as unknown as HTMLCanvasElement;

  const originalCreateElement = document.createElement.bind(document);
  vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
    if (tagName === "canvas") {
      return canvas;
    }

    return originalCreateElement(tagName);
  });

  return { canvas, drawImage, toBlob };
}

describe("optimize-image", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:mock-image"),
      revokeObjectURL: vi.fn(),
    });

    class MockImage {
      onload: null | (() => void) = null;
      onerror: null | (() => void) = null;
      width = mockImageWidth;
      height = mockImageHeight;

      set src(_value: string) {
        this.onload?.();
      }
    }

    vi.stubGlobal("Image", MockImage);
  });

  it("downscales large image to max 512 dimension", async () => {
    mockImageWidth = 2048;
    mockImageHeight = 1024;
    const { canvas, drawImage } = setupCanvasMock();

    await optimizeImageForAvatar(new File(["image"], "avatar.png", { type: "image/png" }));

    expect(canvas.width).toBe(512);
    expect(canvas.height).toBe(256);
    expect(drawImage).toHaveBeenCalledWith(expect.any(Object), 0, 0, 512, 256);
  });

  it("does not upscale small image", async () => {
    mockImageWidth = 128;
    mockImageHeight = 64;
    const { canvas, drawImage } = setupCanvasMock();

    await optimizeImageForAvatar(new File(["image"], "avatar.png", { type: "image/png" }));

    expect(canvas.width).toBe(128);
    expect(canvas.height).toBe(64);
    expect(drawImage).toHaveBeenCalledWith(expect.any(Object), 0, 0, 128, 64);
  });

  it("returns webp when webp encoding succeeds", async () => {
    mockImageWidth = 512;
    mockImageHeight = 512;
    const webpBlob = new Blob(["webp"], { type: "image/webp" });
    const { toBlob } = setupCanvasMock({ blobs: [webpBlob] });

    const result = await optimizeImageForAvatar(
      new File(["image"], "avatar.png", { type: "image/png" }),
    );

    expect(result).toEqual({ blob: webpBlob, extension: "webp" });
    expect(toBlob).toHaveBeenCalledTimes(1);
    expect(toBlob).toHaveBeenCalledWith(expect.any(Function), "image/webp", 0.85);
  });

  it("falls back to jpeg when webp encoding fails", async () => {
    mockImageWidth = 512;
    mockImageHeight = 512;
    const jpegBlob = new Blob(["jpeg"], { type: "image/jpeg" });
    const { toBlob } = setupCanvasMock({ blobs: [null, jpegBlob] });

    const result = await optimizeImageForAvatar(
      new File(["image"], "avatar.png", { type: "image/png" }),
    );

    expect(result).toEqual({ blob: jpegBlob, extension: "jpg" });
    expect(toBlob).toHaveBeenNthCalledWith(1, expect.any(Function), "image/webp", 0.85);
    expect(toBlob).toHaveBeenNthCalledWith(2, expect.any(Function), "image/jpeg", 0.85);
  });

  it("throws avatar_image_optimize_failed when all encodes fail", async () => {
    mockImageWidth = 512;
    mockImageHeight = 512;
    setupCanvasMock({ blobs: [null, null] });

    await expect(
      optimizeImageForAvatar(new File(["image"], "avatar.png", { type: "image/png" })),
    ).rejects.toThrowError("avatar_image_optimize_failed");
  });

  it("throws avatar_canvas_context_unavailable when canvas context is missing", async () => {
    mockImageWidth = 512;
    mockImageHeight = 512;
    setupCanvasMock({ contextAvailable: false });

    await expect(
      optimizeImageForAvatar(new File(["image"], "avatar.png", { type: "image/png" })),
    ).rejects.toThrowError("avatar_canvas_context_unavailable");
  });
});
