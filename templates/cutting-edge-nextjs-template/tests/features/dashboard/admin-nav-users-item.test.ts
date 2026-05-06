import { describe, expect, it } from "vitest";

import { getAdminNavConfig } from "@/features/dashboard/config/admin-nav";
import { getManagerNavConfig } from "@/features/dashboard/config/manager-nav";

const t = (key: string) => key;

describe("dashboard users nav visibility", () => {
  it("includes users route for admin only", () => {
    const admin = getAdminNavConfig(t);
    const manager = getManagerNavConfig(t);

    expect(admin.some((item) => item.href === "/dashboard/users")).toBe(true);
    expect(manager.some((item) => item.href === "/dashboard/users")).toBe(false);
  });
});
