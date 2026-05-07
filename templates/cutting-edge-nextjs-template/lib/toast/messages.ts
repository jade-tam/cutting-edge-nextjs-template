const AUTH_ERROR_TRANSLATION_KEYS = {
  invalid_credentials: "apiErrors.auth.invalid_credentials",
  register_failed: "apiErrors.auth.register_failed",
  forgot_password_failed: "apiErrors.auth.forgot_password_failed",
  auth_client_error: "apiErrors.auth.auth_client_error",
  upstream_service_error: "apiErrors.auth.upstream_service_error",
  auth_failed: "apiErrors.auth.auth_failed",
  permission_denied: "apiErrors.auth.permission_denied",
  insufficient_role: "apiErrors.auth.insufficient_role",
  account_deactivated: "apiErrors.auth.account_deactivated",
  email_already_taken: "apiErrors.auth.email_already_taken",
  username_already_taken: "apiErrors.auth.username_already_taken",
  user_profile_not_found: "apiErrors.auth.user_profile_not_found",
  user_profile_create_failed: "apiErrors.auth.user_profile_create_failed",
  user_profile_update_failed: "apiErrors.auth.user_profile_update_failed",
  cannot_update_self_role: "apiErrors.auth.cannot_update_self_role",
  cannot_deactivate_self: "apiErrors.auth.cannot_deactivate_self",
  not_implemented: "apiErrors.auth.not_implemented",
  invalid_file_type: "apiErrors.auth.invalid_file_type",
  file_too_large: "apiErrors.auth.file_too_large",
  upload_failed: "apiErrors.auth.upload_failed",
  unauthorized: "apiErrors.auth.unauthorized",
  invalid_request: "apiErrors.common.invalid_request",
  request_failed: "apiErrors.common.request_failed",
} as const;

const EXAMPLE_ENTITY_ERROR_TRANSLATION_KEYS = {
  not_found: "apiErrors.exampleEntity.not_found",
  not_implemented: "apiErrors.exampleEntity.not_implemented",
  validation_error: "apiErrors.exampleEntity.validation_error",
  client_error: "apiErrors.exampleEntity.client_error",
  contract_error: "apiErrors.exampleEntity.contract_error",
  upstream_error: "apiErrors.exampleEntity.upstream_error",
  network_error: "apiErrors.exampleEntity.network_error",
  permission_denied: "apiErrors.exampleEntity.permission_denied",
  example_entity_request_failed: "apiErrors.exampleEntity.example_entity_request_failed",
  invalid_request: "apiErrors.common.invalid_request",
  request_failed: "apiErrors.common.request_failed",
} as const;

export function getAuthErrorTranslationKey(
  errorCode: string | undefined,
  fallbackKey:
    | "toast.auth.signInFailed"
    | "toast.auth.registerFailed"
    | "toast.auth.forgotPasswordFailed"
    | "toast.auth.profileUpdateFailed",
) {
  return AUTH_ERROR_TRANSLATION_KEYS[errorCode as keyof typeof AUTH_ERROR_TRANSLATION_KEYS] ?? fallbackKey;
}

export function getExampleEntityErrorTranslationKey(
  errorCode: string | undefined,
  fallbackKey:
    | "toast.exampleEntity.loadFailed"
    | "toast.exampleEntity.loadListFailed"
    | "toast.exampleEntity.saveFailed"
    | "toast.exampleEntity.deleteFailed",
) {
  return (
    EXAMPLE_ENTITY_ERROR_TRANSLATION_KEYS[
      errorCode as keyof typeof EXAMPLE_ENTITY_ERROR_TRANSLATION_KEYS
    ] ?? fallbackKey
  );
}
