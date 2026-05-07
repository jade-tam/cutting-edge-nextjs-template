"use client";

import { useTranslations } from "next-intl";

import LocaleSwitcher from "@/components/navigation/LocaleSwitcher";
import ThemeToggle from "@/components/theme/ThemeToggle";

import DashboardBreadcrumb from "./DashboardBreadcrumb";
import NotificationDropdown from "./NotificationDropdown";

type DashboardTopbarProps = {
  onMenuClick: () => void;
};

export default function DashboardTopbar({ onMenuClick }: DashboardTopbarProps) {
  const t = useTranslations();

  return (
    <div className="navbar shrink-0 border-b bg-base-100 p-2">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <label
          htmlFor="dashboard-drawer"
          className="btn btn-square btn-ghost drawer-button lg:hidden"
          onClick={onMenuClick}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onMenuClick();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={t("dashboardShell.menu")}
        >
          <span className="icon-[fluent--dock-panel-left-24-filled] text-2xl" />
        </label>
        <div className="min-w-0 lg:pl-4">
          <DashboardBreadcrumb />
        </div>
      </div>
      <div className="flex-none flex items-center gap-1">
        <NotificationDropdown />
        <ThemeToggle />
        <LocaleSwitcher />
      </div>
    </div>
  );
}
