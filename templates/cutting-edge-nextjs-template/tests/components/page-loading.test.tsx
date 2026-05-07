import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PageLoading } from "@/components/page-loading";

afterEach(() => {
  cleanup();
});

describe("PageLoading", () => {
  it("renders spinner and skeleton text", () => {
    render(<PageLoading text="Loading dashboard" variant="fullscreen" />);

    expect(screen.getByText("Loading dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("page-loading-spinner")).toBeInTheDocument();
    expect(screen.getByTestId("page-loading-text")).toHaveClass("skeleton", "skeleton-text");
  });

  it("uses fullscreen layout semantics", () => {
    render(<PageLoading text="Loading" variant="fullscreen" />);

    expect(screen.getByTestId("page-loading-root")).toHaveClass("min-h-screen");
  });

  it("uses section layout semantics", () => {
    render(<PageLoading text="Loading" variant="section" />);

    expect(screen.getByTestId("page-loading-root")).toHaveClass("h-full", "w-full");
  });
});
