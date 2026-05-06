import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import UnauthorizedPage from "@/app/[locale]/(auth)/unauthorized/page";

vi.mock("next-intl/server", () => ({
  setRequestLocale: vi.fn(),
  getTranslations: vi.fn(async () => (key: string) => key),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, className }: { href: string; children: ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe("UnauthorizedPage", () => {
  it("renders unauthorized content inside a card with shield warning icon", async () => {
    const node = await UnauthorizedPage({ params: Promise.resolve({ locale: "en" }) });
    const { container } = render(node);
    const intl = await import("next-intl/server");

    expect(intl.getTranslations).toHaveBeenCalledWith("pages.unauthorized");
    expect(intl.setRequestLocale).toHaveBeenCalledWith("en");

    expect(screen.getByText("title")).toBeInTheDocument();
    expect(screen.getByText("heading")).toBeInTheDocument();
    expect(screen.getByText("description")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "backToHome" })).toHaveAttribute("href", "/");

    expect(container.querySelector(".card.bg-base-100.card-border.border-base-300.card-sm.overflow-hidden")).not.toBeNull();
    expect(container.querySelector(".icon-\\[fluent--shield-warning-24-regular\\].size-8")).not.toBeNull();
  });
});
