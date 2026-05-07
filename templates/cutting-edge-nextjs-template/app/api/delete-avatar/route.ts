import { deleteObject, ref } from "firebase/storage";
import { NextResponse } from "next/server";

import { createAuthProvider } from "@/lib/auth/factory";
import { getSessionTokenFromCookie } from "@/lib/auth/session";
import { getFirebaseStorageServer } from "@/lib/firebase/server";
import { isSameOriginMutation } from "@/lib/security/same-origin";

const AVATAR_PATH_PREFIX = "uploads/avatars/";

type DeleteAvatarRequest = {
  path?: string;
};

function isAllowedAvatarPath(path: string, userId: string) {
  return path.startsWith(`${AVATAR_PATH_PREFIX}${userId}/`);
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

  const body = (await request.json().catch(() => null)) as DeleteAvatarRequest | null;
  const path = body?.path?.trim();

  if (!path || !isAllowedAvatarPath(path, session.userId)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  try {
    const storage = getFirebaseStorageServer();
    await deleteObject(ref(storage, path));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "request_failed" }, { status: 500 });
  }
}
