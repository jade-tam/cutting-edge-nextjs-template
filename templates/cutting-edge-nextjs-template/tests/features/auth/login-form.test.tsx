import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import LoginForm from "@/features/auth/components/login-form";

const push = vi.fn();

beforeAll(() => {
  vi.stubGlobal("scrollTo", vi.fn());
});

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, string | number>) => {
    const translations: Record<string, string> = {
      "auth.login.title": "Sign in",
      "auth.login.description": "Welcome back. Enter your credentials to continue.",
      "auth.login.submit": "Sign in",
      "auth.login.submitting": "Signing in...",
      "auth.fields.email.label": "Email",
      "auth.fields.email.placeholder": "john@example.com",
      "auth.fields.password.label": "Password",
      "auth.fields.password.placeholder": "MyP@ssw0rd!2024",
      "auth.fields.password.show": "Show password",
      "auth.fields.password.hide": "Hide password",
      "auth.validation.showMoreErrors": "+{count} more",
      "auth.validation.showLessErrors": "Show less",
      "auth.validation.passwordStrength.weak": "Weak",
      "auth.validation.passwordStrength.fair": "Fair",
      "auth.validation.passwordStrength.good": "Good",
      "auth.validation.passwordStrength.strong": "Strong",
      "auth.actions.orRegister": "Or create an account",
      "auth.actions.forgotPassword": "Forgot password?",
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
  useQueryClient: () => ({ invalidateQueries: vi.fn().mockResolvedValue(undefined) }),
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push }),
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

describe("LoginForm", () => {
  it("renders updated auth UX copy and example placeholders", () => {
    const { container } = render(<LoginForm />);

    expect(
      screen.getByText("Welcome back. Enter your credentials to continue."),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("john@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("MyP@ssw0rd!2024")).toBeInTheDocument();

    const forgotPasswordLink = screen.getByRole("link", { name: "Forgot password?" });
    expect(forgotPasswordLink).toHaveAttribute("href", "/forgot-password");
    expect(forgotPasswordLink).toHaveClass("link", "link-primary", "text-xs");
    expect(forgotPasswordLink.parentElement).toHaveClass("text-right");

    const registerLink = screen.getByRole("link", { name: "Or create an account" });
    expect(registerLink).toHaveAttribute("href", "/register");
    expect(registerLink).toHaveClass("btn", "btn-ghost", "btn-sm", "w-full");

    expect(container.querySelector(".icon-\\[fluent--person-24-regular\\]")).not.toBeNull();
  });

  it("shows email and password validation errors on blur", async () => {
    render(<LoginForm />);

    const emailInput = screen.getByRole("textbox", { name: "Email" });
    const passwordInput = screen.getByLabelText("Password");

    fireEvent.blur(emailInput);
    fireEvent.blur(passwordInput);

    expect(await screen.findByText("validation.email.invalid")).toBeInTheDocument();
    expect(await screen.findByText("validation.password.required")).toBeInTheDocument();
  });
});
