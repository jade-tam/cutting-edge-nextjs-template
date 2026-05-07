import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import ForgotPasswordForm from "@/features/auth/components/forgot-password-form";

beforeAll(() => {
  vi.stubGlobal("scrollTo", vi.fn());
});

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, string | number>) => {
    const translations: Record<string, string> = {
      "auth.forgotPassword.title": "Forgot password",
      "auth.forgotPassword.description": "Enter your email and we will send a reset link.",
      "auth.forgotPassword.submit": "Send reset link",
      "auth.forgotPassword.submitting": "Submitting...",
      "auth.fields.email.label": "Email",
      "auth.fields.email.placeholder": "john@example.com",
      "auth.validation.showMoreErrors": "+{count} more",
      "auth.validation.showLessErrors": "Show less",
      "auth.actions.backToLogin": "Back to login",
    };

    const template = translations[key] ?? key;
    if (!values) {
      return template;
    }

    return Object.entries(values).reduce(
      (message, [name, value]) => message.replace(`{${name}}`, String(value)),
      template,
    );
  },
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    className,
    children,
  }: {
    href: string;
    className?: string;
    children: ReactNode;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  cleanup();
});

describe("ForgotPasswordForm", () => {
  it("renders card style with description, shared field affordance, and back-to-login action", () => {
    const { container } = render(<ForgotPasswordForm />);

    expect(screen.getByText("Enter your email and we will send a reset link.")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveAttribute(
      "placeholder",
      "john@example.com",
    );

    const backToLoginLink = screen.getByRole("link", { name: "Back to login" });
    expect(backToLoginLink).toHaveAttribute("href", "/login");
    expect(backToLoginLink).toHaveClass("btn", "btn-ghost", "btn-sm", "w-full");

    expect(container.querySelector(".card-border.border-base-300.card-sm.overflow-hidden")).not.toBeNull();
    expect(container.querySelector(".icon-\\[fluent--key-24-regular\\].size-5")).not.toBeNull();
  });

  it("shows email validation error on blur", async () => {
    render(<ForgotPasswordForm />);

    const emailInput = screen.getByRole("textbox", { name: "Email" });
    fireEvent.blur(emailInput);

    expect(await screen.findByText("validation.email.invalid")).toBeInTheDocument();
  });
});
