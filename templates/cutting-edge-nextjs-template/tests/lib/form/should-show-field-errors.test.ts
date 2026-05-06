import { describe, expect, it } from "vitest";

import { shouldShowFieldErrors } from "../../../lib/form/should-show-field-errors";

describe("shouldShowFieldErrors", () => {
  it.each([
    { isTouched: false, submissionAttempts: 0, expected: false },
    { isTouched: true, submissionAttempts: 0, expected: true },
    { isTouched: false, submissionAttempts: 1, expected: true },
    { isTouched: true, submissionAttempts: 2, expected: true },
  ])(
    "returns $expected when touched=$isTouched and submissionAttempts=$submissionAttempts",
    ({ isTouched, submissionAttempts, expected }) => {
      expect(shouldShowFieldErrors(isTouched, submissionAttempts)).toBe(
        expected,
      );
    },
  );
});
