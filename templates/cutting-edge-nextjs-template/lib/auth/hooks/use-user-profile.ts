"use client";

import { useQuery } from "@tanstack/react-query";

import type { UserProfile } from "@/lib/auth/types";

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

async function getUserProfile() {
  const res = await fetch("/api/user-profile", {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(await getErrorCode(res));
  }

  return (await res.json()) as UserProfileResponse;
}

export function useUserProfile() {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
  });
}
