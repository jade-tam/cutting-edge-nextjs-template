import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";

describe("sitemap policy", () => {
  it("excludes dashboard urls", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls.some((u) => u.includes("/dashboard"))).toBe(false);
  });
});
