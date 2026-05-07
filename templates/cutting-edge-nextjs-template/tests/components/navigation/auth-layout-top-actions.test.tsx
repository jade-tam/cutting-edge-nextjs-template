import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type React from "react";
import AuthLayout from "@/app/[locale]/(auth)/layout";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    ViewTransition: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

afterEach(() => {
  cleanup();
});

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/components/theme/ThemeToggle", () => ({
  default: () => <div data-testid="theme-toggle" />,
}));

vi.mock("@/components/navigation/LocaleSwitcher", () => ({
  default: () => <div data-testid="locale-switcher" />,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe("auth route group layout", () => {
  it("renders top actions above auth page content", () => {
    const { container } = render(
      <AuthLayout>
        <div data-testid="auth-page-content">login-page</div>
      </AuthLayout>,
    );

    const topActions = screen.getByTestId("auth-top-actions");

    expect(topActions).toBeInTheDocument();
    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
    expect(screen.getByTestId("locale-switcher")).toBeInTheDocument();

    const returnHomeLink = screen.getByRole("link", {
      name: "actions.returnHome",
    });
    expect(returnHomeLink).toHaveAttribute("href", "/");
    expect(
      returnHomeLink.querySelector(".icon-\\[fluent--home-24-regular\\]"),
    ).toBeInTheDocument();

    const content = screen.getByTestId("auth-page-content");
    expect(content).toBeInTheDocument();

    expect(container.firstElementChild).toBe(topActions);
    const transitionContainer = topActions.nextElementSibling as HTMLElement | null;
    expect(transitionContainer).toHaveAttribute("data-page-transition-container");
    expect(transitionContainer).toHaveClass("size-full");
    expect(transitionContainer?.firstElementChild).toBe(content);
  });
});
