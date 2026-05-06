import { describe, expect, it } from "vitest";
import robots from "@/app/robots";

describe("robots policy", () => {
  it("disallows dashboard and api paths", () => {
    const r = robots();
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
    const content = JSON.stringify(rules);

    expect(content).toContain("/dashboard");
    expect(content).toContain("/api/*");
  });
});
