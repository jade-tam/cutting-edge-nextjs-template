import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import LocaleSwitcher from "@/components/navigation/LocaleSwitcher";

const mockReplace = vi.fn();
const mockUsePathname = vi.fn();
const mockUseLocale = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: () => mockUsePathname(),
}));

vi.mock("next-intl", () => ({
  useLocale: () => mockUseLocale(),
  useTranslations: () => (key: string) => key,
}));

describe("LocaleSwitcher", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockUsePathname.mockReturnValue("/about");
    mockUseLocale.mockReturnValue("en");
  });

  afterEach(() => {
    cleanup();
  });

  it("shows active locale code as badge over globe icon", () => {
    render(<LocaleSwitcher />);

    const trigger = screen.getByRole("button", { name: /languageSwitcher\.label/i });

    expect(trigger).toBeInTheDocument();
    expect(screen.getByText("EN")).toBeInTheDocument();
    expect(screen.getByText("EN").tagName).toBe("SPAN");
    expect(screen.getByTestId("locale-globe-icon")).toBeInTheDocument();
  });

  it("shows VI badge when active locale is vi", () => {
    mockUseLocale.mockReturnValue("vi");
    render(<LocaleSwitcher />);

    expect(
      screen.getByRole("button", { name: /languageSwitcher\.label/i }),
    ).toBeInTheDocument();

    expect(screen.getByText("VI")).toBeInTheDocument();
    expect(screen.getByTestId("locale-globe-icon")).toBeInTheDocument();
  });

  it("sets trigger and menu accessibility attributes", () => {
    render(<LocaleSwitcher />);

    const trigger = screen.getByRole("button", { name: /languageSwitcher\.label/i });
    const menu = screen.getByRole("menu");

    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-controls", "locale-switcher-menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(menu).toHaveAttribute("id", "locale-switcher-menu");
  });

  it("marks active locale menu item with aria-current", () => {
    mockUseLocale.mockReturnValue("vi");
    render(<LocaleSwitcher />);

    expect(screen.getByRole("menuitem", { name: "languageSwitcher.vietnamese" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("menuitem", { name: "languageSwitcher.english" })).not.toHaveAttribute("aria-current");
  });

  it("switches locale while preserving pathname", () => {
    render(<LocaleSwitcher />);

    fireEvent.click(screen.getByRole("button", { name: /languageSwitcher\.label/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: "languageSwitcher.vietnamese" }));

    expect(mockReplace).toHaveBeenCalledWith("/about", { locale: "vi" });
  });
});
