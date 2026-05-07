"use client";

import { useTranslations } from "next-intl";

import { DashboardPageShell } from "@/features/dashboard/components/dashboard-page-shell";
import UsersTable from "@/features/user-management/components/users-table";

export default function UsersPage() {
  const t = useTranslations();

  return (
    <DashboardPageShell
      title={t("pages.userManagement.title")}
      description={t("pages.userManagement.description")}
    >
      <div className="min-h-0 flex-1">
        <UsersTable />
      </div>
    </DashboardPageShell>
  );
}
