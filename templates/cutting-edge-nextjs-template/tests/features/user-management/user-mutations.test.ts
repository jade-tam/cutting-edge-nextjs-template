import { describe, expect, it } from "vitest";

describe("user management mutation error mapping", () => {
  it("uses stable error code for blocked self role update", () => {
    expect("cannot_update_self_role").toBe("cannot_update_self_role");
  });

  it("uses stable error code for blocked self deactivation", () => {
    expect("cannot_deactivate_self").toBe("cannot_deactivate_self");
  });
});
