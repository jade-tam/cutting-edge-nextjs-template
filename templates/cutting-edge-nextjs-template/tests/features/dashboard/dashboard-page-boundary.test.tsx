import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardPageBoundary } from "@/features/dashboard/components/dashboard-page-boundary";

describe("DashboardPageBoundary", () => {
  it("renders section loading when pending", () => {
    render(
      <DashboardPageBoundary isPending loadingText="Loading users">
        <div>Users loaded</div>
      </DashboardPageBoundary>,
    );

    expect(screen.getByTestId("page-loading-root")).toHaveClass("h-full", "w-full");
  });
});
