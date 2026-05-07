"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { showErrorToast } from "@/lib/toast/toast";

import { ConfirmationModal } from "@/components/confirmation-modal";
import { useRouter } from "@/i18n/navigation";
import type { UserRole } from "@/lib/auth/types";
import { getAuthErrorTranslationKey } from "@/lib/toast/messages";

import DashboardSidebar from "./DashboardSidebar";
import DashboardTopbar from "./DashboardTopbar";

type NavItem = {
  href: string;
  label: string;
  iconClass?: string;
  requiredRole?: UserRole[];
  subItems?: NavItem[];
};

type DashboardShellProps = {
  children: React.ReactNode;
  navItems: NavItem[];
};

async function postLogout() {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorCode = "auth_failed";

    try {
      const body = (await response.json()) as { error?: unknown };
      if (typeof body.error === "string" && body.error.length > 0) {
        errorCode = body.error;
      }
    } catch {
      // Keep default auth_failed when response body is not JSON.
    }

    throw new Error(errorCode);
  }
}

export default function DashboardShell({
  children,
  navItems,
}: DashboardShellProps) {
  const t = useTranslations();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const router = useRouter();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: postLogout,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      router.push("/login");
    },
    onError: (error) => {
      showErrorToast(
        t(getAuthErrorTranslationKey(error.message, "toast.auth.signInFailed")),
      );
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
    setShowLogoutModal(false);
  };

  return (
    <div className="drawer h-[100dvh] overflow-hidden lg:drawer-open motion-safe:dashboard-shell-enter">
      <input
        id="dashboard-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={sidebarOpen}
        readOnly
      />
      <div className="drawer-content flex h-[100dvh] min-h-0 flex-col overflow-hidden">
        <DashboardTopbar
          onMenuClick={() => setSidebarOpen((value) => !value)}
        />

        <div className="w-full flex-1 min-h-0 overflow-y-auto p-2">{children}</div>
      </div>

      <div className="drawer-side z-50">
        <label
          htmlFor="dashboard-drawer"
          className="drawer-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label={t("dashboardShell.actions.closeDrawer")}
        />
        <DashboardSidebar
          navItems={navItems}
          onClose={() => setSidebarOpen(false)}
          onLogoutClick={() => setShowLogoutModal(true)}
        />
      </div>

      <ConfirmationModal
        isOpen={showLogoutModal}
        title={t("dashboardShell.logoutModal.title")}
        message={t("dashboardShell.logoutModal.message")}
        confirmLabel={
          logoutMutation.isPending
            ? t("dashboardShell.actions.signingOut")
            : t("dashboardShell.logoutModal.confirm")
        }
        cancelLabel={t("dashboardShell.logoutModal.cancel")}
        closeLabel={t("dashboardShell.logoutModal.close")}
        confirmClassName="btn btn-error"
        isConfirming={logoutMutation.isPending}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  );
}
