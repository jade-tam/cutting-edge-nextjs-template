import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  refreshMock: vi.fn(),
  killMock: vi.fn(),
  createMock: vi.fn(),
  registerPluginMock: vi.fn(),
  getMock: vi.fn(),
  revertMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/en",
}));

vi.mock("gsap", () => {
  const context = (fn: () => void) => {
    fn();
    return { revert: mocks.revertMock };
  };

  return {
    default: {
      registerPlugin: mocks.registerPluginMock,
      context,
    },
  };
});

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {
    refresh: mocks.refreshMock,
  },
}));

vi.mock("gsap/ScrollSmoother", () => ({
  ScrollSmoother: {
    get: mocks.getMock,
    create: mocks.createMock,
  },
}));

import MarketingSmoothScroll from "@/components/marketing/marketing-smooth-scroll";

describe("MarketingSmoothScroll", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    mocks.getMock.mockReturnValue(null);
  });

  it("renders children inside smoother structure", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const smootherInstance = { kill: mocks.killMock };
    mocks.createMock.mockReturnValue(smootherInstance);

    render(
      <MarketingSmoothScroll>
        <div>Marketing content</div>
      </MarketingSmoothScroll>,
    );

    expect(screen.getByText("Marketing content")).toBeInTheDocument();
    expect(document.getElementById("marketing-smooth-wrapper")).not.toBeNull();
    expect(document.getElementById("marketing-smooth-content")).not.toBeNull();
    expect(mocks.registerPluginMock).toHaveBeenCalled();
    expect(mocks.createMock).toHaveBeenCalled();
    expect(mocks.refreshMock).toHaveBeenCalled();
  });

  it("skips smoother setup when reduced motion is enabled", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(
      <MarketingSmoothScroll>
        <div>Reduced motion</div>
      </MarketingSmoothScroll>,
    );

    expect(mocks.createMock).not.toHaveBeenCalled();
    expect(mocks.refreshMock).not.toHaveBeenCalled();
  });

  it("kills owned smoother instance on unmount", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const smootherInstance = { kill: mocks.killMock };
    mocks.createMock.mockReturnValue(smootherInstance);

    const { unmount } = render(
      <MarketingSmoothScroll>
        <div>Cleanup test</div>
      </MarketingSmoothScroll>,
    );

    unmount();

    expect(mocks.killMock).toHaveBeenCalledTimes(1);
    expect(mocks.revertMock).toHaveBeenCalled();
  });
});
