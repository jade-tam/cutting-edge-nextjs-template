import { NextResponse } from "next/server";

import { createAuthProvider } from "@/lib/auth/factory";
import { getSessionTokenFromCookie } from "@/lib/auth/session";
import { isSameOriginMutation } from "@/lib/security/same-origin";
import { uploadImage } from "@/lib/storage/upload-image";

const MAX_AVATAR_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

function getAvatarExtensionFromMimeType(type: string): "png" | "jpg" | "webp" {
  switch (type) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}

function getUploadAvatarErrorCode(error: unknown): "unauthorized" | "upload_failed" {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code ?? "")
      : "";

  if (
    code === "storage/unauthorized" ||
    code === "permission_denied" ||
    code === "auth/insufficient-permission"
  ) {
    return "unauthorized";
  }

  return "upload_failed";
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const token = await getSessionTokenFromCookie();

  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const provider = createAuthProvider();
  const session = await provider.getSession(token);

  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || !ALLOWED_AVATAR_TYPES.has(file.type)) {
    return NextResponse.json({ error: "invalid_file_type" }, { status: 400 });
  }

  if (file.size > MAX_AVATAR_FILE_BYTES) {
    return NextResponse.json({ error: "file_too_large" }, { status: 400 });
  }

  try {
    const extension = getAvatarExtensionFromMimeType(file.type);
    const result = await uploadImage({
      file,
      category: "avatars",
      entityId: session.userId,
      extension,
    });

    return NextResponse.json(result);
  } catch (error) {
    const errorCode = getUploadAvatarErrorCode(error);

    if (errorCode === "unauthorized") {
      return NextResponse.json({ error: errorCode }, { status: 401 });
    }

    return NextResponse.json({ error: errorCode }, { status: 500 });
  }
}
