import type { ReactNode } from "react";
import type { DataTableColumnDef } from "@/components/data-table/types";
import type { ManagedUser } from "@/features/user-management/types";

type UsersTableColumnOptions = {
  t: (key: string) => string;
  onRequestRoleChange: (user: ManagedUser, role: ManagedUser["role"]) => void;
  onRequestStatusChange: (user: ManagedUser) => void;
};

function roleBadgeClass(role: ManagedUser["role"]) {
  if (role === "admin") return "badge-error";
  if (role === "manager") return "badge-info";
  return "badge-neutral";
}

function statusBadgeClass(isActive: boolean) {
  return isActive ? "badge-success" : "badge-error";
}

function badgeClass(colorClass: string) {
  return `badge badge-xs whitespace-nowrap ${colorClass}`;
}

function actionLabel(isSelf: boolean, content: ReactNode) {
  if (!isSelf) return content;
  return (
    <span className="inline-flex items-center gap-1">
      {content}
      <span className="text-xs opacity-60">(self)</span>
    </span>
  );
}

function actionWithIcon(iconClass: string, label: string) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`${iconClass} text-base`} />
      <span>{label}</span>
    </span>
  );
}

export function createUsersTableColumns({
  t,
  onRequestRoleChange,
  onRequestStatusChange,
}: UsersTableColumnOptions): DataTableColumnDef<ManagedUser>[] {
  return [
    {
      id: "email",
      header: <span>Email</span>,
      accessorFn: (row) => row.email,
      cell: (row) => <span className="font-medium">{row.email}</span>,
    },
    {
      id: "username",
      header: <span>Username</span>,
      accessorFn: (row) => row.username ?? "",
      cell: (row) => <span>{row.username ?? "-"}</span>,
    },
    {
      id: "role",
      header: <span>{t("pages.userManagement.columns.role")}</span>,
      accessorFn: (row) => row.role,
      cell: (row) => (
        <span className={badgeClass(roleBadgeClass(row.role))}>
          {t(`pages.userManagement.roles.${row.role}`)}
        </span>
      ),
    },
    {
      id: "isActive",
      header: <span>{t("pages.userManagement.columns.status")}</span>,
      accessorFn: (row) => (row.isActive ? "active" : "inactive"),
      cell: (row) => (
        <span className={badgeClass(statusBadgeClass(row.isActive))}>
          {row.isActive
            ? t("pages.userManagement.status.active")
            : t("pages.userManagement.status.inactive")}
        </span>
      ),
    },
    {
      id: "actions",
      header: <span className="float-end">{t("pages.userManagement.columns.actions")}</span>,
      accessorFn: () => "",
      enableSorting: false,
      meta: {
        className: "space-x-2 text-right whitespace-nowrap",
        isActions: true,
      },
      cell: (user) => {
        const disabled = user.isSelf;
        return (
          <>
            <div className="dropdown dropdown-end">
              <button
                type="button"
                tabIndex={0}
                className="btn btn-sm btn-soft btn-info"
                disabled={disabled}
              >
                {actionLabel(
                  disabled,
                  <span className="inline-flex items-center gap-1">
                    {actionWithIcon(
                      "icon-[fluent--person-settings-24-regular]",
                      t("pages.userManagement.actions.changeRole"),
                    )}
                    <span className="icon-[fluent--chevron-down-20-regular] text-sm" />
                  </span>,
                )}
              </button>
              <ul
                tabIndex={0}
                className="menu dropdown-content z-[20] mt-1 w-40 rounded-box border border-base-300 bg-base-100 p-1 shadow"
              >
                {(["admin", "manager", "user"] as const).map((role) => (
                  <li key={role}>
                    <button
                      type="button"
                      className={role === user.role ? "active" : ""}
                      onClick={() => onRequestRoleChange(user, role)}
                    >
                      {role}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              className={`btn btn-sm btn-soft ${user.isActive ? "btn-error" : "btn-success"}`}
              disabled={disabled}
              onClick={() => onRequestStatusChange(user)}
            >
              {actionLabel(
                disabled,
                actionWithIcon(
                  user.isActive
                    ? "icon-[fluent--dismiss-circle-24-regular]"
                    : "icon-[fluent--checkmark-circle-24-regular]",
                  user.isActive
                    ? t("pages.userManagement.actions.deactivate")
                    : t("pages.userManagement.actions.activate"),
                ),
              )}
            </button>
          </>
        );
      },
    },
  ];
}
