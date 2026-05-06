import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ThemeToggle from "@/components/theme/ThemeToggle";
import ThemeProvider from "@/providers/theme-provider";

function renderThemeToggle(initialTheme: "breakingbit" | "breakingbit-light" = "breakingbit") {
  return render(
    <ThemeProvider initialTheme={initialTheme}>
      <ThemeToggle />
    </ThemeProvider>,
  );
}

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.cookie = "theme=; path=/; max-age=0";
    document.documentElement.setAttribute("data-theme", "breakingbit");
  });

  afterEach(() => {
    cleanup();
  });

  it("renders toggle button", () => {
    renderThemeToggle();

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("uses provider initial theme on mount", () => {
    renderThemeToggle("breakingbit-light");

    expect(document.documentElement.getAttribute("data-theme")).toBe(
      "breakingbit-light",
    );
  });

  it("switches to light theme and persists when clicked from dark", () => {
    renderThemeToggle();

    fireEvent.click(screen.getByRole("button"));

    expect(document.documentElement.getAttribute("data-theme")).toBe(
      "breakingbit-light",
    );
    expect(document.cookie).toContain("theme=breakingbit-light");
  });

  it("switches to dark theme and persists when clicked from light", () => {
    renderThemeToggle("breakingbit-light");

    fireEvent.click(screen.getByRole("button"));

    expect(document.documentElement.getAttribute("data-theme")).toBe("breakingbit");
    expect(document.cookie).toContain("theme=breakingbit");
  });
});
