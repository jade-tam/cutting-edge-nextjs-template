import { NextResponse } from "next/server";

import { AUTH_ERROR, getStatusForAuthError } from "@/lib/auth/errors";
import { createAuthProvider } from "@/lib/auth/factory";
import { getSessionTokenFromCookie } from "@/lib/auth/session";
import {
  getStatusForUserManagementError,
  USER_MANAGEMENT_ERROR,
} from "@/lib/user-management/errors";
import { createUserManagementProvider } from "@/lib/user-management/factory";

export async function requireAdminSession() {
  const token = await getSessionTokenFromCookie();

  if (!token) {
    return {
      response: NextResponse.json(
        { error: AUTH_ERROR.INVALID_CREDENTIALS },
        { status: getStatusForAuthError(AUTH_ERROR.INVALID_CREDENTIALS) },
      ),
      session: null,
      provider: null,
    } as const;
  }

  const authProvider = createAuthProvider();

  try {
    const session = await authProvider.getSession(token);

    if (!session || session.role !== "admin") {
      return {
        response: NextResponse.json({ error: AUTH_ERROR.INSUFFICIENT_ROLE }, { status: 403 }),
        session: null,
        provider: null,
      } as const;
    }

    return {
      response: null,
      session,
      provider: createUserManagementProvider(),
    } as const;
  } catch (error) {
    return {
      response: NextResponse.json(
        { error: AUTH_ERROR.AUTH_CLIENT_ERROR },
        { status: getStatusForAuthError(error) },
      ),
      session: null,
      provider: null,
    } as const;
  }
}

export function toErrorResponse(error: unknown) {
  const status = getStatusForUserManagementError(error);

  if (error instanceof Error) {
    const code = Object.values(USER_MANAGEMENT_ERROR).includes(
      error.message as (typeof USER_MANAGEMENT_ERROR)[keyof typeof USER_MANAGEMENT_ERROR],
    )
      ? error.message
      : USER_MANAGEMENT_ERROR.UPSTREAM_SERVICE_ERROR;

    return NextResponse.json({ error: code }, { status });
  }

  return NextResponse.json(
    { error: USER_MANAGEMENT_ERROR.UPSTREAM_SERVICE_ERROR },
    { status },
  );
}
