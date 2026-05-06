import { describe, expect, it } from "vitest";

import nextConfig from "../../next.config";

describe("next config", () => {
  it("enables experimental view transitions", () => {
    expect(nextConfig.experimental?.viewTransition).toBe(true);
  });
});
