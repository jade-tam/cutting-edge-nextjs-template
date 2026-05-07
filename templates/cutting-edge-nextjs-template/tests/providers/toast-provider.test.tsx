import { render } from "@testing-library/react";
import { expect, it, vi } from "vitest";

vi.mock("sonner", () => ({
  Toaster: () => <div data-testid="sonner-toaster" />,
}));

import ToastProvider from "@/providers/toast-provider";

it("renders toaster", () => {
  const { getByTestId } = render(<ToastProvider />);
  expect(getByTestId("sonner-toaster")).toBeInTheDocument();
});
