import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type React from "react";

const viewTransitionMock = vi.fn(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
);

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    ViewTransition: (props: {
      children: React.ReactNode;
      enter: string;
      exit: string;
      update: string;
      default: string;
    }) => viewTransitionMock(props),
  };
});

const { PageTransitionShell } = await import(
  "@/components/transitions/page-transition-shell"
);
import {
  DEFAULT_TRANSITION_MODE,
  PAGE_TRANSITION_MODES,
} from "@/config/transitions/page-transitions";

afterEach(() => {
  cleanup();
  viewTransitionMock.mockClear();
});

describe("PageTransitionShell", () => {
  it("uses default mode preset", () => {
    render(
      <PageTransitionShell>
        <div>content</div>
      </PageTransitionShell>,
    );

    expect(screen.getByText("content")).toBeInTheDocument();
    expect(viewTransitionMock).toHaveBeenCalledTimes(1);

    const props = viewTransitionMock.mock.calls[0][0];
    expect(props).toMatchObject(PAGE_TRANSITION_MODES[DEFAULT_TRANSITION_MODE]);
  });

  it("uses subtle mode preset", () => {
    render(
      <PageTransitionShell mode="subtle">
        <div>content</div>
      </PageTransitionShell>,
    );

    const props = viewTransitionMock.mock.calls[0][0];
    expect(props).toMatchObject(PAGE_TRANSITION_MODES.subtle);
  });

  it("uses none mode preset", () => {
    render(
      <PageTransitionShell mode="none">
        <div>content</div>
      </PageTransitionShell>,
    );

    const props = viewTransitionMock.mock.calls[0][0];
    expect(props).toMatchObject(PAGE_TRANSITION_MODES.none);
  });

  it("renders with transitionKey override", () => {
    render(
      <PageTransitionShell transitionKey="forced-key">
        <div>content</div>
      </PageTransitionShell>,
    );

    expect(screen.getByText("content")).toBeInTheDocument();
    expect(viewTransitionMock).toHaveBeenCalledTimes(1);
  });

  it("renders children inside a stable transition container", () => {
    const { container } = render(
      <PageTransitionShell>
        <div>content</div>
      </PageTransitionShell>,
    );

    const stableContainer = container.querySelector("[data-page-transition-container]");

    expect(stableContainer).toBeInTheDocument();
    expect(stableContainer).toContainElement(screen.getByText("content"));
  });
});
