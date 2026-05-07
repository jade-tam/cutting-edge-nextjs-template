export const USER_MANAGEMENT_ERROR = {
  NOT_IMPLEMENTED: "not_implemented",
  USER_PROFILE_NOT_FOUND: "user_profile_not_found",
  USER_PROFILE_UPDATE_FAILED: "user_profile_update_failed",
  UPSTREAM_SERVICE_ERROR: "upstream_service_error",
  PERMISSION_DENIED: "permission_denied",
} as const;

export type UserManagementErrorCode =
  (typeof USER_MANAGEMENT_ERROR)[keyof typeof USER_MANAGEMENT_ERROR];

export class UserManagementError extends Error {
  constructor(public readonly code: UserManagementErrorCode) {
    super(code);
    this.name = "UserManagementError";
  }
}

const statusMap: Record<UserManagementErrorCode, number> = {
  [USER_MANAGEMENT_ERROR.NOT_IMPLEMENTED]: 501,
  [USER_MANAGEMENT_ERROR.USER_PROFILE_NOT_FOUND]: 404,
  [USER_MANAGEMENT_ERROR.USER_PROFILE_UPDATE_FAILED]: 500,
  [USER_MANAGEMENT_ERROR.UPSTREAM_SERVICE_ERROR]: 502,
  [USER_MANAGEMENT_ERROR.PERMISSION_DENIED]: 403,
};

export function getStatusForUserManagementError(error: unknown): number {
  if (error instanceof UserManagementError) {
    return statusMap[error.code];
  }

  if (error instanceof Error) {
    const asCode = error.message as UserManagementErrorCode;

    if (Object.values(USER_MANAGEMENT_ERROR).includes(asCode)) {
      return statusMap[asCode];
    }
  }

  return 500;
}
