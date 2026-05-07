const MAX_AVATAR_DIMENSION = 512;
const IMAGE_QUALITY = 0.85;

type AvatarOptimizedImage = {
  blob: Blob;
  extension: "webp" | "jpg";
};

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("avatar_image_load_failed"));
    };

    image.src = objectUrl;
  });
}

function getTargetSize(width: number, height: number) {
  const scale = Math.min(1, MAX_AVATAR_DIMENSION / Math.max(width, height));

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

export async function optimizeImageForAvatar(
  file: File,
): Promise<AvatarOptimizedImage> {
  const image = await loadImageFromFile(file);
  const target = getTargetSize(image.width, image.height);

  const canvas = document.createElement("canvas");
  canvas.width = target.width;
  canvas.height = target.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("avatar_canvas_context_unavailable");
  }

  context.drawImage(image, 0, 0, target.width, target.height);

  const webpBlob = await canvasToBlob(canvas, "image/webp", IMAGE_QUALITY);
  if (webpBlob) {
    return { blob: webpBlob, extension: "webp" };
  }

  const jpegBlob = await canvasToBlob(canvas, "image/jpeg", IMAGE_QUALITY);
  if (jpegBlob) {
    return { blob: jpegBlob, extension: "jpg" };
  }

  throw new Error("avatar_image_optimize_failed");
}
