"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateUserRole } from "@/features/user-management/api";

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserRole,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
