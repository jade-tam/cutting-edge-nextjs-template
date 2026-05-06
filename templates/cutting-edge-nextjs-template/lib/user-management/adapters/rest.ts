import type { UserManagementProvider } from "../contracts";
import { USER_MANAGEMENT_ERROR, UserManagementError } from "../errors";

function unsupported(): never {
  throw new UserManagementError(USER_MANAGEMENT_ERROR.NOT_IMPLEMENTED);
}

export function createRestUserManagementProvider(): UserManagementProvider {
  return {
    kind: "rest",
    async listUsers() {
      return unsupported();
    },
    async updateUserRole() {
      return unsupported();
    },
    async updateUserStatus() {
      return unsupported();
    },
    async bulkUpdateUserRole() {
      return unsupported();
    },
    async bulkUpdateUserStatus() {
      return unsupported();
    },
  };
}
