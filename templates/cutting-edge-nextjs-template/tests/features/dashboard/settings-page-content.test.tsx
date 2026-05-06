import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import DashboardSettingsPage from "@/app/[locale]/(dashboard)/dashboard/settings/page";

const { themeToggleMock } = vi.hoisted(() => ({
  themeToggleMock: vi.fn(() => <button type="button">ThemeToggleMock</button>),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/components/theme/ThemeToggle", () => ({
  default: themeToggleMock,
}));

describe("DashboardSettingsPage", () => {
  it("renders appearance row and ThemeToggle", () => {
    render(<DashboardSettingsPage />);

    expect(screen.getByText("pages.settings.title")).toBeInTheDocument();
    expect(screen.getByText("pages.settings.description")).toBeInTheDocument();
    expect(screen.getByText("pages.settings.appearance.title")).toBeInTheDocument();
    expect(screen.getByText("pages.settings.appearance.description")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ThemeToggleMock" })).toBeInTheDocument();
  });
});
