"use client";

import { useQuery } from "@tanstack/react-query";

import { getUserProfile } from "@/features/auth/api";

export function useUserProfile() {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
  });
}
