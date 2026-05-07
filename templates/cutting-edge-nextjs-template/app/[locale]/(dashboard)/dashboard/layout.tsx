"use client";

import { useTranslations } from "next-intl";

import { PageTransitionShell } from "@/components/transitions/page-transition-shell";
import { DashboardClientBootstrap } from "@/features/dashboard/components/dashboard-client-bootstrap";
import DashboardShell from "@/features/dashboard/components/shell/DashboardShell";
import { getAdminNavConfig } from "@/features/dashboard/config/admin-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const adminNavItems = getAdminNavConfig(t);

  return (
    <DashboardClientBootstrap>
      <DashboardShell navItems={adminNavItems}>
        <PageTransitionShell>{children}</PageTransitionShell>
      </DashboardShell>
    </DashboardClientBootstrap>
  );
}
