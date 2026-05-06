import type { DashboardNavConfig } from "../types";

import { getStaffNavConfig } from "./admin-nav";

export function getManagerNavConfig(t: (key: string) => string): DashboardNavConfig {
  return getStaffNavConfig(t);
}
