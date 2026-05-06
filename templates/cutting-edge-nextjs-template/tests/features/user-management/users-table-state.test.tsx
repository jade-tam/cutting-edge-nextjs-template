import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import UsersTable from "@/features/user-management/components/users-table";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, string | number>) => {
    const translations: Record<string, string> = {
      "pages.userManagement.bulkActions.activateSingleModal.description": "Are you sure you want to activate {email} ({username})?",
      "pages.userManagement.bulkActions.deactivateSingleModal.description": "Are you sure you want to deactivate {email} ({username})?",
    };

    const template = translations[key] ?? key;
    if (!values) {
      return template;
    }

    return Object.entries(values).reduce(
      (message, [token, value]) => message.replaceAll(`{${token}}`, String(value)),
      template,
    );
  },
}));

vi.mock("@/features/user-management/hooks/use-users", () => ({
  useUsers: () => ({
    isLoading: false,
    data: {
      users: [
        {
          id: "self-id",
          email: "admin@example.com",
          role: "admin",
          isActive: true,
          username: "admin",
          isSelf: true,
        },
        {
          id: "user-id",
          email: "user@example.com",
          role: "user",
          isActive: false,
          username: "user",
          isSelf: false,
        },
      ],
    },
  }),
}));

vi.mock("@/features/user-management/hooks/use-update-user-role", () => ({
  useUpdateUserRole: () => ({ mutateAsync: vi.fn() }),
}));

const mutateStatusMock = vi.fn().mockResolvedValue(undefined);

vi.mock("@/features/user-management/hooks/use-update-user-status", () => ({
  useUpdateUserStatus: () => ({ mutateAsync: mutateStatusMock }),
}));

describe("users table self-row constraints", () => {
  it("disables role and status actions for self row", () => {
    render(<UsersTable />);

    const selfCell = within(screen.getAllByRole("rowgroup")[1] as HTMLElement).getByText("admin@example.com");
    const selfRow = selfCell.closest("tr");
    expect(selfRow).not.toBeNull();

    expect(
      within(selfRow as HTMLTableRowElement).getByRole("button", {
        name: /pages\.userManagement\.actions\.changeRole/i,
      }),
    ).toBeDisabled();
    expect(
      within(selfRow as HTMLTableRowElement).getByRole("button", {
        name: /pages\.userManagement\.actions\.deactivate/i,
      }),
    ).toBeDisabled();
  });

  it("requires confirmation before bulk activation", async () => {
    mutateStatusMock.mockClear();
    render(<UsersTable />);

    const targetCell = within(screen.getAllByRole("rowgroup")[1] as HTMLElement).getByText("user@example.com");
    const targetRow = targetCell.closest("tr");
    expect(targetRow).not.toBeNull();

    fireEvent.click(
      within(targetRow as HTMLTableRowElement).getByRole("checkbox", {
        name: /table\.selectRow/i,
      }),
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: /pages\.userManagement\.actions\.activateSelected/i,
      }),
    );

    expect(mutateStatusMock).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getByRole("button", {
        name: /pages\.userManagement\.bulkActions\.confirmActivate/i,
      }),
    );

    await waitFor(() => {
      expect(mutateStatusMock).toHaveBeenCalledWith({
        id: "user-id",
        isActive: true,
      });
    });
  });

  it("requires confirmation before single-row deactivation and shows identity", async () => {
    mutateStatusMock.mockClear();
    render(<UsersTable />);

    const targetCell = within(screen.getAllByRole("rowgroup")[1] as HTMLElement).getByText("user@example.com");
    const targetRow = targetCell.closest("tr");
    expect(targetRow).not.toBeNull();

    fireEvent.click(
      within(targetRow as HTMLTableRowElement).getByRole("button", {
        name: /pages\.userManagement\.actions\.activate/i,
      }),
    );

    expect(mutateStatusMock).not.toHaveBeenCalled();
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(/user@example\.com/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/\(user\)/i)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: /pages\.userManagement\.bulkActions\.confirmActivate/i,
      }),
    );

    await waitFor(() => {
      expect(mutateStatusMock).toHaveBeenCalledWith({
        id: "user-id",
        isActive: true,
      });
    });
  });
});
