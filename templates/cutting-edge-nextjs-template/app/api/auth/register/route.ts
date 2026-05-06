import { NextResponse } from "next/server";

import { registerSchema } from "@/features/auth/schemas/register-schema";
import { getAuthErrorCode, getStatusForAuthError } from "@/lib/auth/errors";
import { createAuthProvider } from "@/lib/auth/factory";
import { setSessionCookie } from "@/lib/auth/session";

export async function POST(request: Request) {
  let parsedBody: unknown;

  try {
    parsedBody = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const payload = registerSchema.safeParse(parsedBody);

  if (!payload.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  try {
    const provider = createAuthProvider();
    const { email, password, fullName, username } = payload.data;
    const result = await provider.register({
      email,
      password,
      fullName,
      username,
    });

    await provider.createUserProfile({
      userId: result.session.userId,
      email: result.session.email,
      fullName: payload.data.fullName,
      username: payload.data.username,
    });

    await setSessionCookie(result.sessionToken);

    return NextResponse.json({ session: result.session });
  } catch (error) {
    const code = getAuthErrorCode(error);
    return NextResponse.json(
      { error: code ?? "auth_failed" },
      { status: getStatusForAuthError(error) },
    );
  }
}
