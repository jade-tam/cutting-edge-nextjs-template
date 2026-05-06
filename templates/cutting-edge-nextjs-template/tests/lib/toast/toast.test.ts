import { beforeEach, describe, expect, it, vi } from "vitest";

const success = vi.fn();
const error = vi.fn();
const info = vi.fn();
const warning = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success,
    error,
    info,
    warning,
  },
}));

describe("lib/toast/toast", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates success toast calls", async () => {
    const { showSuccessToast } = await import("@/lib/toast/toast");
    showSuccessToast("saved");
    expect(success).toHaveBeenCalledWith("saved");
  });

  it("delegates error toast calls", async () => {
    const { showErrorToast } = await import("@/lib/toast/toast");
    showErrorToast("failed");
    expect(error).toHaveBeenCalledWith("failed");
  });
});
