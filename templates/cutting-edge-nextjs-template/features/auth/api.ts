import type { AuthSession, UserProfile } from "@/lib/auth/types";

import type { ForgotPasswordSchema } from "@/features/auth/schemas/forgot-password-schema";
import type { LoginSchema } from "@/features/auth/schemas/login-schema";
import type { RegisterSchema } from "@/features/auth/schemas/register-schema";
import type { UserProfileUpdateSchema } from "@/features/auth/schemas/user-profile-schema";

type SessionResponse = {
  session: AuthSession;
};

type ForgotPasswordResponse = {
  ok: true;
};

type LogoutResponse = {
  ok: true;
};

type SessionLookupResponse = {
  session: AuthSession | null;
};

type UserProfileResponse = {
  profile: UserProfile;
};

type ErrorResponse = {
  error?: string;
};

async function getErrorCode(response: Response) {
  try {
    const body = (await response.json()) as ErrorResponse;
    return body.error ?? "request_failed";
  } catch {
    return "request_failed";
  }
}

export async function postLogin(payload: LoginSchema) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await getErrorCode(res));
  }

  return (await res.json()) as SessionResponse;
}

export async function postRegister(payload: RegisterSchema) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await getErrorCode(res));
  }

  return (await res.json()) as SessionResponse;
}

export async function postForgotPassword(payload: ForgotPasswordSchema) {
  const res = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await getErrorCode(res));
  }

  return (await res.json()) as ForgotPasswordResponse;
}

export async function postLogout() {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(await getErrorCode(res));
  }

  return (await res.json()) as LogoutResponse;
}

export async function getSession() {
  const res = await fetch("/api/auth/session", {
    method: "GET",
    credentials: "include",
  });

  if (res.status === 401) {
    return { session: null } satisfies SessionLookupResponse;
  }

  if (!res.ok) {
    throw new Error("session_lookup_failed");
  }

  return (await res.json()) as SessionLookupResponse;
}

export async function getUserProfile() {
  const res = await fetch("/api/user-profile", {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(await getErrorCode(res));
  }

  return (await res.json()) as UserProfileResponse;
}

export async function patchUserProfile(payload: UserProfileUpdateSchema) {
  const res = await fetch("/api/user-profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await getErrorCode(res));
  }

  return (await res.json()) as UserProfileResponse;
}
