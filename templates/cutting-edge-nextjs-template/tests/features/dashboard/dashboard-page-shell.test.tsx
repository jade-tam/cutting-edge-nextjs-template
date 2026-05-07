import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DashboardPageShell } from "@/features/dashboard/components/dashboard-page-shell";

afterEach(() => {
  cleanup();
});

describe("DashboardPageShell", () => {
  it("renders title, description, and children", () => {
    render(
      <DashboardPageShell title="Title" description="Description">
        <div data-testid="content">content</div>
      </DashboardPageShell>,
    );

    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  it("renders header actions when provided", () => {
    render(
      <DashboardPageShell title="Title" headerActions={<button type="button">Action</button>}>
        <div>content</div>
      </DashboardPageShell>,
    );

    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });

  it("keeps the exact wrapper and header classes", () => {
    const view = render(
      <DashboardPageShell title="Title" description="Description">
        <div>content</div>
      </DashboardPageShell>,
    );

    const heading = view.getByRole("heading", { name: "Title", level: 1 });
    const description = view.getByText("Description");
    const section = heading.closest("section");
    const header = heading.closest("header");

    expect(section).not.toBeNull();
    expect(header).not.toBeNull();
    expect(section).toHaveClass(
      "md:space-y-4",
      "space-y-2",
      "mx-auto",
      "max-w-7xl",
      "pb-4",
    );
    expect(header).toHaveClass("space-y-2", "md:pt-2");
    expect(heading).toHaveClass("md:text-3xl", "text-xl", "font-semibold");
    expect(description).toHaveClass("text-base-content/70");
  });

  it("omits description and header actions when not provided", () => {
    const view = render(
      <DashboardPageShell title="Title">
        <div>content</div>
      </DashboardPageShell>,
    );

    expect(view.getByRole("heading", { name: "Title", level: 1 })).toBeInTheDocument();
    expect(view.queryByText("Description")).not.toBeInTheDocument();
    expect(view.queryByRole("button", { name: "Action" })).not.toBeInTheDocument();
  });
});
