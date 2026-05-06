import type {
  ManagedUser,
  ManagedUsersListResponse,
  ManagedUserRole,
} from "@/features/user-management/types";

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

export async function listUsers() {
  const res = await fetch("/api/admin/users", {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(await getErrorCode(res));
  }

  return (await res.json()) as ManagedUsersListResponse;
}

export async function updateUserRole(params: {
  id: string;
  role: ManagedUserRole;
}) {
  const res = await fetch(`/api/admin/users/${params.id}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ role: params.role }),
  });

  if (!res.ok) {
    throw new Error(await getErrorCode(res));
  }

  return (await res.json()) as ManagedUser;
}

export async function updateUserStatus(params: {
  id: string;
  isActive: boolean;
}) {
  const res = await fetch(`/api/admin/users/${params.id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ isActive: params.isActive }),
  });

  if (!res.ok) {
    throw new Error(await getErrorCode(res));
  }

  return (await res.json()) as ManagedUser;
}
