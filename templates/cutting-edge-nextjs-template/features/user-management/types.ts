export type ManagedUserRole = "admin" | "manager" | "user";

export type ManagedUser = {
  id: string;
  email: string;
  role: ManagedUserRole;
  isActive: boolean;
  fullName?: string;
  username?: string;
};

export type ManagedUsersListResponse = {
  users: ManagedUser[];
  total: number;
};
