import type {
  AdminBulkMutationResult,
  AdminBulkUpdateUserRoleInput,
  AdminBulkUpdateUserStatusInput,
  AdminUpdateUserRoleInput,
  AdminUpdateUserStatusInput,
  AdminUserListResponse,
  ManagedUserProfile,
} from "./types";

export interface UserManagementProvider {
  kind: "rest" | "firebase";
  listUsers(): Promise<AdminUserListResponse>;
  updateUserRole(input: AdminUpdateUserRoleInput): Promise<ManagedUserProfile>;
  updateUserStatus(input: AdminUpdateUserStatusInput): Promise<ManagedUserProfile>;
  bulkUpdateUserRole(input: AdminBulkUpdateUserRoleInput): Promise<AdminBulkMutationResult>;
  bulkUpdateUserStatus(input: AdminBulkUpdateUserStatusInput): Promise<AdminBulkMutationResult>;
}
