import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    ViewTransition: ({ children }: { children: ReactNode }) => <>{children}</>,
  };
});

import { PageTransitionShell } from "@/components/transitions/page-transition-shell";
import DashboardShell from "@/features/dashboard/components/shell/DashboardShell";

const {
  routerPushMock,
  invalidateQueriesMock,
  mutationState,
} = vi.hoisted(() => ({
  routerPushMock: vi.fn(),
  invalidateQueriesMock: vi.fn().mockResolvedValue(undefined),
  mutationState: { shouldFail: false },
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: ({ onSuccess, onError }: { onSuccess?: () => Promise<void> | void; onError?: (error: Error) => void }) => ({
    mutate: vi.fn(async () => {
      if (mutationState.shouldFail) {
        onError?.(new Error("permission_denied"));
        return;
      }

      await onSuccess?.();
    }),
    isPending: false,
  }),
  useQuery: () => ({ data: null }),
  useQueryClient: () => ({ invalidateQueries: invalidateQueriesMock }),
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
        avatarUrl: null,
      },
    },
    isLoading: false,
    isError: false,
  }),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, className }: { href: string; children: ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: routerPushMock }),
}));

vi.mock("@/components/theme/ThemeToggle", () => ({
  default: () => <div data-testid="theme-toggle" />,
}));

vi.mock("@/components/navigation/LocaleSwitcher", () => ({
  default: () => <div data-testid="locale-switcher" />,
}));

describe("DashboardShell layout", () => {
  const navItems = [
    {
      href: "/dashboard",
      label: "dashboardShell.nav.overview",
      iconClass: "icon-[fluent--gauge-24-regular] text-2xl",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mutationState.shouldFail = false;
  });

  it("applies dashboard enter animation on shell root", () => {
    const { container } = render(
      <DashboardShell navItems={navItems}>
        <PageTransitionShell>
          <div>dashboard-content</div>
        </PageTransitionShell>
      </DashboardShell>,
    );

    const shellRoot = container.querySelector(".drawer");

    expect(shellRoot).toHaveClass("motion-safe:dashboard-shell-enter");
  });

  it("applies p-2 padding and max-w-7xl constraint to content wrapper", () => {
    render(
      <DashboardShell navItems={navItems}>
        <PageTransitionShell>
          <div>dashboard-content</div>
        </PageTransitionShell>
      </DashboardShell>,
    );

    const contentNode = screen.getAllByText("dashboard-content")[0];
    const contentWrap = contentNode.closest(".w-full.flex-1.min-h-0.overflow-y-auto.p-2");

    expect(contentWrap).toBeInTheDocument();
  });

  it("pushes localized login route after confirming successful logout", async () => {
    render(
      <DashboardShell navItems={navItems}>
        <PageTransitionShell>
          <div>dashboard-content</div>
        </PageTransitionShell>
      </DashboardShell>,
    );

    fireEvent.click(
      screen.getAllByRole("button", { name: "dashboardShell.tooltips.logout" })[0],
    );

    fireEvent.click(
      screen.getByRole("button", { name: "dashboardShell.logoutModal.confirm" }),
    );

    await waitFor(() => {
      expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ["session"] });
      expect(routerPushMock).toHaveBeenCalledWith("/login");
    });
  });
});
