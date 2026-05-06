"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchUserProfile } from "@/features/auth/api";

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchUserProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
}
