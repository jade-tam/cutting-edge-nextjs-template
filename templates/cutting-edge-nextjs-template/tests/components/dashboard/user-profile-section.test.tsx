import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

afterEach(() => {
  cleanup();
});

import UserProfileSection from "@/features/dashboard/components/shell/UserProfileSection";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    onClick,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </a>
  ),
  usePathname: () => "/dashboard",
}));

vi.mock("@/lib/auth/hooks/use-session", () => ({
  useSession: () => ({
    data: {
      session: {
        userId: "u1",
        email: "manager@example.com",
        role: "manager",
      },
    },
  }),
}));

vi.mock("@/lib/auth/hooks/use-user-profile", () => ({
  useUserProfile: () => ({
    data: {
      profile: {
        username: "manager01",
        email: "manager@example.com",
        role: "manager",
        avatarUrl: "https://cdn.example.com/avatar.png",
      },
    },
    isLoading: false,
    isError: false,
  }),
}));

describe("UserProfileSection", () => {
  it("renders username, email, and avatar from query data", () => {
    render(<UserProfileSection onLogout={vi.fn()} />);

    expect(screen.getByText("manager01")).toBeInTheDocument();
    expect(screen.getByText("manager@example.com")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "dashboardShell.profile.avatarAlt" })).toBeInTheDocument();
  });

  it("calls onClose when profile link is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<UserProfileSection onLogout={vi.fn()} onClose={onClose} />);

    await user.click(screen.getByRole("link", { name: /manager01/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when settings link is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<UserProfileSection onLogout={vi.fn()} onClose={onClose} />);

    await user.click(screen.getByRole("link", { name: "dashboardShell.tooltips.settings" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when logout button is clicked (logout still called)", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onLogout = vi.fn();

    render(<UserProfileSection onLogout={onLogout} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "dashboardShell.tooltips.logout" }));

    expect(onClose).not.toHaveBeenCalled();
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
