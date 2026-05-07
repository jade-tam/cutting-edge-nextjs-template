import { describe, expect, it } from "vitest";
import {
  buildOrganizationSchema,
  buildWebsiteSchema,
} from "@/lib/seo/schema";

describe("SEO schema builders", () => {
  it("builds website and organization schema", () => {
    const website = buildWebsiteSchema({
      url: "https://example.com",
      name: "Site",
      description: "Desc",
    });

    const organization = buildOrganizationSchema({
      url: "https://example.com",
      name: "Site",
      logoUrl: "https://example.com/icon-512.png",
    });

    expect(website["@type"]).toBe("WebSite");
    expect(organization["@type"]).toBe("Organization");
  });
});
