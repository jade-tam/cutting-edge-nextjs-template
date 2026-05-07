import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import MainNavbar from "@/components/navigation/MainNavbar";

let pathname = "/en";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    if (key === "home") return "Home";
    if (key === "solutions") return "Solutions";
    if (key === "pricing") return "Pricing";
    if (key === "contact") return "Contact";
    if (key === "mainMenu") return "Main menu";
    if (key === "openMenu") return "Open menu";
    if (key === "closeMenu") return "Close menu";
    return key;
  },
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/theme/ThemeToggle", () => ({
  default: () => <div data-testid="theme-toggle" />,
}));

vi.mock("@/components/navigation/LocaleSwitcher", () => ({
  default: () => <div data-testid="locale-switcher" />,
}));

describe("MainNavbar", () => {
  beforeEach(() => {
    pathname = "/en";
    Object.defineProperty(window, "scrollY", {
      value: 0,
      writable: true,
      configurable: true,
    });

    window.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    }) as typeof window.requestAnimationFrame;

    window.cancelAnimationFrame = vi.fn();
  });

  it("renders nav links and controls", () => {
    render(<MainNavbar />);

    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Solutions" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Pricing" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Contact" }).length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("theme-toggle").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("locale-switcher").length).toBeGreaterThan(0);
  });

  it("closes mobile drawer when pathname changes", async () => {
    const { rerender, container } = render(<MainNavbar />);

    const getDrawerToggle = () => container.querySelector<HTMLInputElement>(".drawer-toggle");

    const drawerToggle = getDrawerToggle();
    expect(drawerToggle).not.toBeNull();
    if (!drawerToggle) return;

    drawerToggle.checked = true;
    expect(drawerToggle.checked).toBe(true);

    pathname = "/en/pricing";
    rerender(<MainNavbar />);

    await waitFor(() => {
      expect(getDrawerToggle()?.checked).toBe(false);
    });
  });

  it("shows navbar again after route change when previously hidden", async () => {
    const { rerender, container } = render(<MainNavbar />);

    const getHeader = () => container.querySelector("header");

    const header = getHeader();
    expect(header).not.toBeNull();
    if (!header) return;

    Object.defineProperty(window, "scrollY", {
      value: 120,
      writable: true,
      configurable: true,
    });
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(getHeader()?.className).toContain("-translate-y-full");
    });

    pathname = "/en/contact";
    rerender(<MainNavbar />);

    await waitFor(() => {
      expect(getHeader()?.className).toContain("translate-y-0");
      expect(getHeader()?.className).not.toContain("-translate-y-full");
    });
  });
});
