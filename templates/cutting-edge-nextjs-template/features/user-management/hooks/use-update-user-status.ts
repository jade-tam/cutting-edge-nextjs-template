"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateUserStatus } from "@/features/user-management/api";

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserStatus,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
