"use client";

import { useQuery } from "@tanstack/react-query";

import type { AuthSession } from "@/lib/auth/types";

type SessionLookupResponse = {
  session: AuthSession | null;
};

async function getSession() {
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

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: getSession,
  });
}
