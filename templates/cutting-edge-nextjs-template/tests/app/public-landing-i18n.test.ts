import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("public landing i18n keys", () => {
  it("uses pages.public.landing translation keys", () => {
    const page = readFileSync("app/[locale]/(public)/page.tsx", "utf8");

    expect(page).toContain('t("pages.public.landing.title")');
    expect(page).toContain('t("pages.public.landing.description")');
  });
});
