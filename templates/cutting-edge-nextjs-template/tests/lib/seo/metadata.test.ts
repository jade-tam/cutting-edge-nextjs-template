import { describe, expect, it } from "vitest";
import { buildAlternates } from "@/config/seo";

describe("SEO alternates", () => {
  it("includes en, vi, and x-default", () => {
    const alternates = buildAlternates("/");
    expect(alternates.languages.en).toContain("https://");
    expect(alternates.languages.vi).toContain("/vi");
    expect(alternates.languages["x-default"]).toContain("https://");
  });
});
