import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DashboardShell from "@/features/dashboard/components/shell/DashboardShell";

const {
  routerPushMock,
  invalidateQueriesMock,
  toastErrorMock,
  getAuthErrorTranslationKeyMock,
  mutationState,
} = vi.hoisted(() => ({
  routerPushMock: vi.fn(),
  invalidateQueriesMock: vi.fn().mockResolvedValue(undefined),
  toastErrorMock: vi.fn(),
  getAuthErrorTranslationKeyMock: vi.fn((errorCode: string) => `apiErrors.${errorCode}`),
  mutationState: { shouldFail: false },
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("sonner", () => ({
  toast: {
    error: toastErrorMock,
  },
}));

vi.mock("@/lib/toast/messages", () => ({
  getAuthErrorTranslationKey: getAuthErrorTranslationKeyMock,
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

describe("DashboardShell topbar controls", () => {
  const navItems = [
    {
      href: "/dashboard",
      label: "dashboardShell.nav.overview",
      iconClass: "icon-[fluent--gauge-24-regular] text-2xl",
    },
    {
      href: "/dashboard/example-entities",
      label: "dashboardShell.nav.exampleEntities",
      iconClass: "icon-[fluent--database-24-regular] text-2xl",
      requiredRole: ["admin", "manager"],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mutationState.shouldFail = false;
  });

  it("renders localized navigation and topbar labels", () => {
    const { container } = render(
      <DashboardShell navItems={navItems}>
        <div>dashboard-content</div>
      </DashboardShell>,
    );

    const drawerRoot = container.querySelector(".drawer");
    expect(drawerRoot).toHaveClass("h-[100dvh]");
    expect(drawerRoot).toHaveClass("overflow-hidden");

    const drawerContent = container.querySelector(".drawer-content");
    expect(drawerContent).toHaveClass("h-[100dvh]");
    expect(drawerContent).toHaveClass("min-h-0");
    expect(drawerContent).toHaveClass("overflow-hidden");

    const contentNode = screen.getByText("dashboard-content");
    const contentWrap = contentNode.parentElement;
    expect(contentWrap).toHaveClass("flex-1");
    expect(contentWrap).toHaveClass("min-h-0");
    expect(contentWrap).toHaveClass("overflow-y-auto");

    const topbar = container.querySelector(".navbar");
    expect(topbar).toHaveClass("shrink-0");

    const breadcrumbNav = container.querySelector("nav[aria-label='dashboardShell.breadcrumb.label']");
    expect(breadcrumbNav).toHaveClass("min-w-0");
    expect(breadcrumbNav).toHaveClass("overflow-hidden");

    const sidebar = container.querySelector("aside");
    expect(sidebar).toHaveClass("h-[100dvh]");

    expect(screen.getAllByText("dashboardShell.nav.overview").length).toBeGreaterThan(0);
    expect(screen.getByText("dashboardShell.nav.exampleEntities")).toBeInTheDocument();
    expect(screen.getByText("dashboardShell.nav.backToSite")).toBeInTheDocument();
    expect(screen.getAllByText("dashboardShell.brand").length).toBeGreaterThan(0);

    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
    expect(screen.getByTestId("locale-switcher")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "dashboardShell.tooltips.logout" }),
    ).toBeInTheDocument();

    expect(screen.getByText("manager01")).toBeInTheDocument();
    expect(screen.getByText("manager@example.com")).toBeInTheDocument();
  });

  it("shows mapped error toast when logout returns permission_denied", async () => {
    mutationState.shouldFail = true;

    render(
      <DashboardShell navItems={navItems}>
        <div>dashboard-content</div>
      </DashboardShell>,
    );

    fireEvent.click(
      screen.getAllByRole("button", { name: "dashboardShell.tooltips.logout" })[0],
    );

    fireEvent.click(
      screen.getByRole("button", { name: "dashboardShell.logoutModal.confirm" }),
    );

    await waitFor(() => {
      expect(getAuthErrorTranslationKeyMock).toHaveBeenCalledWith(
        "permission_denied",
        "toast.auth.signInFailed",
      );
      expect(toastErrorMock).toHaveBeenCalledWith("apiErrors.permission_denied");
    });

    expect(routerPushMock).not.toHaveBeenCalled();
  });
});
