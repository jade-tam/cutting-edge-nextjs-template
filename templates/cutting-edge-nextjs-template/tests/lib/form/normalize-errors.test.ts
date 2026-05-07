import { describe, expect, it, vi } from "vitest";

import { normalizeErrors } from "../../../lib/form/normalize-errors";

describe("normalizeErrors", () => {
  it("translates validation keys and preserves non-validation text", () => {
    const t = vi.fn((key: string) => {
      if (key === "validation.required") {
        return "Field is required";
      }

      return key;
    });

    expect(
      normalizeErrors(["validation.required", "Unexpected failure"], t),
    ).toEqual(["Field is required", "Unexpected failure"]);
    expect(t).toHaveBeenCalledWith("validation.required");
  });

  it("deduplicates repeated normalized messages", () => {
    expect(normalizeErrors(["Already used", "Already used"])).toEqual([
      "Already used",
    ]);
  });

  it("splits comma-separated validation messages and trims each part", () => {
    const t = vi.fn((key: string) => {
      const translations: Record<string, string> = {
        "validation.slug.required": "Slug is required",
        "validation.slug.format": "Slug format is invalid",
      };

      return translations[key] ?? key;
    });

    expect(
      normalizeErrors(["validation.slug.required, validation.slug.format"], t),
    ).toEqual(["Slug is required", "Slug format is invalid"]);
  });

  it("passes through non-validation messages from error objects", () => {
    expect(normalizeErrors([{ message: "Service unavailable" }])).toEqual([
      "Service unavailable",
    ]);
  });
});
