import { describe, expect, it } from "vitest";

import {
  formatEntityDate,
  parseTableUrlState,
  toTableUrlSearchParams,
} from "@/components/data-table/utils";

describe("data-table utils", () => {
  it("parses and serializes table URL state", () => {
    const state = parseTableUrlState(
      new URLSearchParams("page=2&size=25&sort=updatedAt.desc&q=roadmap&f_status=draft"),
    );

    expect(state.page).toBe(2);
    expect(state.size).toBe(25);
    expect(state.sort).toBe("updatedAt.desc");
    expect(state.query).toBe("roadmap");
    expect(state.filters.status).toBe("draft");

    const params = toTableUrlSearchParams(state);
    expect(params.get("page")).toBe("2");
    expect(params.get("size")).toBe("25");
    expect(params.get("sort")).toBe("updatedAt.desc");
    expect(params.get("q")).toBe("roadmap");
    expect(params.get("f_status")).toBe("draft");
  });

  it("round-trips array filters with repeated URL params", () => {
    const state = parseTableUrlState(
      new URLSearchParams("f_status=draft&f_status=published&f_category=product"),
    );

    expect(state.filters.status).toEqual(["draft", "published"]);
    expect(state.filters.category).toBe("product");

    const params = toTableUrlSearchParams(state);
    expect(params.getAll("f_status")).toEqual(["draft", "published"]);
    expect(params.get("f_category")).toBe("product");
  });

  it("returns fallback for null and invalid date values", () => {
    expect(formatEntityDate(null, "en-US")).toBe("-");
    expect(formatEntityDate("not-a-date", "en-US")).toBe("-");
  });

  it("formats valid date values by locale", () => {
    expect(formatEntityDate("2026-04-12T09:30:00.000Z", "en-US")).toContain("2026");
  });
});
