"use client";

import { useQuery } from "@tanstack/react-query";

import { listUsers } from "@/features/user-management/api";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: listUsers,
  });
}
