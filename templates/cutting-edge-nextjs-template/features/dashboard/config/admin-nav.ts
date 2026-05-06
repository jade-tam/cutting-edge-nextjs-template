import type { DashboardNavConfig } from "../types";

export function getStaffNavConfig(t: (key: string) => string): DashboardNavConfig {
  return [
    {
      href: "/dashboard",
      label: t("dashboardShell.nav.overview"),
      iconClass: "icon-[fluent--gauge-24-regular] text-2xl",
    },
    {
      href: "/dashboard/example-entities",
      label: t("dashboardShell.nav.exampleEntities"),
      iconClass: "icon-[fluent--database-24-regular] text-2xl",
    },
  ];
}

export function getAdminNavConfig(t: (key: string) => string): DashboardNavConfig {
  return [
    ...getStaffNavConfig(t),
    {
      href: "/dashboard/users",
      label: t("dashboardShell.nav.users"),
      iconClass: "icon-[fluent--people-24-regular] text-2xl",
      requiredRole: ["admin"],
    },
  ];
}
