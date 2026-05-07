"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { showErrorToast, showSuccessToast } from "@/lib/toast/toast";

import { ConfirmationModal } from "@/components/confirmation-modal";
import { DataTable } from "@/components/data-table/data-table";
import type {
  DataTableBulkAction,
  TableFilterConfig,
} from "@/components/data-table/types";
import { createUsersTableColumns } from "@/features/user-management/components/users-table-columns";
import { useUpdateUserRole } from "@/features/user-management/hooks/use-update-user-role";
import { useUpdateUserStatus } from "@/features/user-management/hooks/use-update-user-status";
import { useUsers } from "@/features/user-management/hooks/use-users";
import type { ManagedUser } from "@/features/user-management/types";

function toErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return "request_failed";
}

export default function UsersTable() {
  const t = useTranslations();
  const listQuery = useUsers();
  const updateRoleMutation = useUpdateUserRole();
  const updateStatusMutation = useUpdateUserStatus();
  const { mutateAsync: updateRole } = updateRoleMutation;

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [confirmAction, setConfirmAction] = useState<
    | {
        type: "activate" | "deactivate";
        rows: ManagedUser[];
      }
    | null
  >(null);

  const rows = listQuery.data?.users ?? [];

  const columns = useMemo(
    () =>
      createUsersTableColumns({
        t: (key) => t(key),
        onRequestRoleChange: async (user, role) => {
          if (user.role === role) {
            return;
          }

          try {
            await updateRole({ id: user.id, role });
            showSuccessToast(t("toast.auth.profileUpdated"));
          } catch (error) {
            showErrorToast(toErrorMessage(error));
          }
        },
        onRequestStatusChange: async (user) => {
          setConfirmAction({
            type: user.isActive ? "deactivate" : "activate",
            rows: [user],
          });
        },
      }),
    [t, updateRole],
  );

  const filterConfig = useMemo<TableFilterConfig[]>(
    () => [
      {
        id: "role",
        label: t("pages.userManagement.columns.role"),
        clearOptionLabel: t("pages.userManagement.filters.allRoles"),
        options: ["admin", "manager", "user"].map((value) => ({
          value,
          label: t(`pages.userManagement.roles.${value}`),
        })),
      },
      {
        id: "isActive",
        label: t("pages.userManagement.columns.status"),
        clearOptionLabel: t("pages.userManagement.filters.allStatuses"),
        options: [
          { value: "active", label: t("pages.userManagement.status.active") },
          { value: "inactive", label: t("pages.userManagement.status.inactive") },
        ],
      },
    ],
    [t],
  );

  const bulkActions = useMemo<DataTableBulkAction<ManagedUser>[]>(
    () => [
      {
        id: "bulk-activate",
        label: t("pages.userManagement.actions.activateSelected"),
        className: "btn btn-sm btn-success",
        onClick: async (selectedRows) => {
          setConfirmAction({
            type: "activate",
            rows: selectedRows.filter((item) => !item.isSelf),
          });
        },
      },
      {
        id: "bulk-deactivate",
        label: t("pages.userManagement.actions.deactivateSelected"),
        className: "btn btn-sm btn-error",
        onClick: async (selectedRows) => {
          setConfirmAction({
            type: "deactivate",
            rows: selectedRows.filter((item) => !item.isSelf),
          });
        },
      },
    ],
    [t],
  );

  const handleConfirmAction = async () => {
    if (!confirmAction) {
      return;
    }

    const isActive = confirmAction.type === "activate";

    try {
      for (const row of confirmAction.rows) {
        await updateStatusMutation.mutateAsync({ id: row.id, isActive });
      }
      showSuccessToast(t("toast.auth.profileUpdated"));
      setConfirmAction(null);
    } catch (error) {
      showErrorToast(toErrorMessage(error));
    }
  };

  const isActivateAction = confirmAction?.type === "activate";
  const isSingleRowAction = (confirmAction?.rows.length ?? 0) === 1;
  const targetUser = confirmAction?.rows[0];

  const confirmTitle = isSingleRowAction
    ? isActivateAction
      ? t("pages.userManagement.bulkActions.activateSingleModal.title")
      : t("pages.userManagement.bulkActions.deactivateSingleModal.title")
    : isActivateAction
      ? t("pages.userManagement.bulkActions.activateModal.title", {
          count: confirmAction?.rows.length ?? 0,
        })
      : t("pages.userManagement.bulkActions.deactivateModal.title", {
          count: confirmAction?.rows.length ?? 0,
        });

  const confirmDescription = isSingleRowAction
    ? isActivateAction
      ? t("pages.userManagement.bulkActions.activateSingleModal.description", {
          email: targetUser?.email ?? "",
          username: targetUser?.username ?? "",
        })
      : t("pages.userManagement.bulkActions.deactivateSingleModal.description", {
          email: targetUser?.email ?? "",
          username: targetUser?.username ?? "",
        })
    : isActivateAction
      ? t("pages.userManagement.bulkActions.activateModal.description")
      : t("pages.userManagement.bulkActions.deactivateModal.description");

  const confirmLabel = isActivateAction
    ? t("pages.userManagement.bulkActions.confirmActivate")
    : t("pages.userManagement.bulkActions.confirmDeactivate");
  const confirmClassName = isActivateAction ? "btn btn-success" : "btn btn-error";

  const closeConfirmModal = () => setConfirmAction(null);

  const filterValues = {
    role: roleFilter,
    isActive: statusFilter,
  };

  return (
    <>
      <DataTable
        rows={rows}
        columns={columns}
        isLoading={listQuery.isLoading}
        emptyLabel={t("pages.userManagement.empty")}
        emptyFilteredLabel={t("pages.userManagement.emptyFiltered")}
        globalFilter={query}
        onGlobalFilterChange={setQuery}
        filterConfig={filterConfig}
        filterValues={filterValues}
        onFilterChange={(id, value) => {
          if (id === "role") {
            setRoleFilter(Array.isArray(value) ? value[0] ?? "" : value);
            return;
          }

          if (id === "isActive") {
            setStatusFilter(Array.isArray(value) ? value[0] ?? "" : value);
          }
        }}
        bulkActions={bulkActions}
        searchLabel={t("pages.userManagement.search.label")}
        searchPlaceholder={t("pages.userManagement.search.placeholder")}
        getRowId={(row) => row.id}
        isRowSelectable={(row) => !row.isSelf}
      />

      <ConfirmationModal
        isOpen={Boolean(confirmAction)}
        title={confirmTitle}
        message={confirmDescription}
        confirmLabel={confirmLabel}
        cancelLabel={t("pages.userManagement.bulkActions.cancel")}
        closeLabel={t("pages.userManagement.bulkActions.close")}
        confirmClassName={confirmClassName}
        isConfirming={updateStatusMutation.isPending}
        onConfirm={handleConfirmAction}
        onCancel={closeConfirmModal}
      />
    </>
  );
}
