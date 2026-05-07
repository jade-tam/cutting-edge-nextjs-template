export type ManagedUserRole = "admin" | "manager" | "user";

export type ManagedUserProfile = {
  userId: string;
  email: string;
  role: ManagedUserRole;
  fullName: string;
  username: string | null;
  isActive: boolean;
};

export type AdminUserListResponse = {
  users: ManagedUserProfile[];
  total: number;
};

export type AdminUpdateUserRoleInput = {
  userId: string;
  role: ManagedUserRole;
};

export type AdminUpdateUserStatusInput = {
  userId: string;
  isActive: boolean;
};

export type AdminBulkUpdateUserRoleInput = {
  userIds: string[];
  role: ManagedUserRole;
};

export type AdminBulkUpdateUserStatusInput = {
  userIds: string[];
  isActive: boolean;
};

export type AdminBulkMutationResult = {
  ok: true;
  updated: number;
};
