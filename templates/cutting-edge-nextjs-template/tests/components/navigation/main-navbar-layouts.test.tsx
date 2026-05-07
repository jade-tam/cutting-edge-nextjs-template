import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type React from "react";

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

import PublicLayout from "@/app/[locale]/(public)/layout";

vi.mock("next/navigation", () => ({
  usePathname: () => "/en",
}));

vi.mock("gsap", () => {
  const context = (fn: () => void) => {
    fn();
    return { revert: vi.fn() };
  };

  return {
    default: {
      registerPlugin: vi.fn(),
      context,
    },
  };
});

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {
    refresh: vi.fn(),
  },
}));

vi.mock("gsap/ScrollSmoother", () => ({
  ScrollSmoother: {
    get: vi.fn(() => null),
    create: vi.fn(),
  },
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: query === "(prefers-reduced-motion: reduce)" ? false : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.mock("@/components/marketing/marketing-smooth-scroll", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="marketing-smooth-scroll">{children}</div>
  ),
}));


vi.mock("@/components/navigation/MainNavbar", () => ({
  default: () => <div data-testid="main-navbar" />,
}));

describe("route group layouts", () => {
  it("renders main navbar in public layout", () => {
    render(
      <PublicLayout>
        <div>public-page</div>
      </PublicLayout>,
    );

    expect(screen.getByTestId("main-navbar")).toBeInTheDocument();
    expect(screen.getByText("public-page")).toBeInTheDocument();
  });
});
