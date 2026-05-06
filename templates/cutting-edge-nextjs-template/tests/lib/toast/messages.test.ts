import { describe, expect, it } from "vitest";

import { getAuthErrorTranslationKey } from "@/lib/toast/messages";

describe("getAuthErrorTranslationKey", () => {
  it("maps upload avatar API errors", () => {
    expect(getAuthErrorTranslationKey("invalid_file_type", "toast.auth.profileUpdateFailed")).toBe(
      "apiErrors.auth.invalid_file_type",
    );

    expect(getAuthErrorTranslationKey("file_too_large", "toast.auth.profileUpdateFailed")).toBe(
      "apiErrors.auth.file_too_large",
    );

    expect(getAuthErrorTranslationKey("upload_failed", "toast.auth.profileUpdateFailed")).toBe(
      "apiErrors.auth.upload_failed",
    );

    expect(getAuthErrorTranslationKey("unauthorized", "toast.auth.profileUpdateFailed")).toBe(
      "apiErrors.auth.unauthorized",
    );
  });

  it("falls back to provided key for unknown code", () => {
    expect(getAuthErrorTranslationKey("unknown_error", "toast.auth.profileUpdateFailed")).toBe(
      "toast.auth.profileUpdateFailed",
    );
  });
});
