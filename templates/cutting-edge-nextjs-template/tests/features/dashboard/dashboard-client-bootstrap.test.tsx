import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DashboardClientBootstrap } from "@/features/dashboard/components/dashboard-client-bootstrap";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

describe("DashboardClientBootstrap", () => {
  it("renders fullscreen loading during initial bootstrap", () => {
    render(
      <DashboardClientBootstrap>
        <div>Dashboard ready</div>
      </DashboardClientBootstrap>,
    );

    expect(screen.getByTestId("page-loading-root")).toHaveClass("min-h-screen");
  });
});
