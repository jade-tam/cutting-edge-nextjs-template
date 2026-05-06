import type { UserRole } from "@/lib/auth/types";

export type NavItem = {
  href: string;
  label: string;
  iconClass?: string;
  requiredRole?: UserRole[];
  subItems?: NavItem[];
};

export type DashboardNavConfig = NavItem[];
