import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import PasswordField from "@/features/auth/components/password-field";

describe("PasswordField", () => {
  it("toggles password visibility via button labels", async () => {
    const user = userEvent.setup();
    const onChange = () => {};
    const onBlur = () => {};

    render(
      <PasswordField
        label="Password"
        value=""
        errors={[]}
        onChange={onChange}
        onBlur={onBlur}
        placeholder="Enter your secret password"
        showLabel="Show password"
        hideLabel="Hide password"
        showMoreErrorsLabel={(count) => `Show ${count} more errors`}
        showLessErrorsLabel="Show less"
        strengthLabels={{
          weak: "Weak",
          fair: "Fair",
          good: "Good",
          strong: "Strong",
        }}
      />
    );

    const input = screen.getByPlaceholderText("Enter your secret password");
    expect(input).toHaveAttribute("type", "password");

    const showButton = screen.getByRole("button", { name: "Show password" });
    await user.click(showButton);

    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide password" })).toBeInTheDocument();

    const hideButton = screen.getByRole("button", { name: "Hide password" });
    await user.click(hideButton);

    expect(input).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Show password" })).toBeInTheDocument();
  });

  it("renders strength indicator when enabled", () => {
    const onChange = () => {};
    const onBlur = () => {};

    render(
      <PasswordField
        label="Password"
        value="weak123"
        errors={[]}
        onChange={onChange}
        onBlur={onBlur}
        placeholder="Enter your secret password"
        showLabel="Show password"
        hideLabel="Hide password"
        showMoreErrorsLabel={(count) => `Show ${count} more errors`}
        showLessErrorsLabel="Show less"
        showStrength={true}
        strengthLabels={{
          weak: "Weak",
          fair: "Fair",
          good: "Good",
          strong: "Strong",
        }}
      />
    );

    expect(screen.getByText("Weak")).toBeInTheDocument();
  });
});
