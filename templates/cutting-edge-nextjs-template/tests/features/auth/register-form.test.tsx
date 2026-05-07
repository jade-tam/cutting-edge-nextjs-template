import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import RegisterForm from "@/features/auth/components/register-form";

const push = vi.fn();

function getRegisterForm(): HTMLElement {
  return screen.getAllByRole("button", { name: "Create account" }).at(-1)!
    .closest("form") as HTMLFormElement;
}

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, string | number>) => {
    const translations: Record<string, string> = {
      "auth.register.title": "Create account",
      "auth.register.description": "Create your account to start using the dashboard.",
      "auth.register.submit": "Create account",
      "auth.register.submitting": "Creating account...",
      "auth.fields.fullName.label": "Full name",
      "auth.fields.fullName.placeholder": "John Doe",
      "auth.fields.username.label": "Username",
      "auth.fields.username.placeholder": "your_username",
      "auth.fields.email.label": "Email",
      "auth.fields.email.placeholder": "john@example.com",
      "auth.fields.password.label": "Password",
      "auth.fields.password.placeholder": "MyP@ssw0rd!2024",
      "auth.fields.password.show": "Show password",
      "auth.fields.password.hide": "Hide password",
      "auth.fields.confirmPassword.label": "Confirm password",
      "auth.fields.confirmPassword.placeholder": "JohnDoe123!",
      "auth.validation.showMoreErrors": "+{count} more",
      "auth.validation.showLessErrors": "Show less",
      "auth.validation.passwordStrength.weak": "Weak",
      "auth.validation.passwordStrength.fair": "Fair",
      "auth.validation.passwordStrength.good": "Good",
      "auth.validation.passwordStrength.strong": "Strong",
      "auth.actions.orLogin": "Or sign in",
      "validation.username.tooShort": "Username must be at least 3 characters",
      "validation.password.tooShort": "Password must be at least 12 characters",
      "validation.password.missingUppercase": "Password must contain at least one uppercase letter",
      "validation.password.missingLowercase": "Password must contain at least one lowercase letter",
      "validation.password.missingNumber": "Password must contain at least one number",
      "validation.password.missingSymbol": "Password must contain at least one special character",
      "validation.confirmPassword.mismatch": "Passwords do not match",
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

vi.mock("motion/react", () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: {
    span: ({ children, ...props }: ComponentProps<"span">) => <span {...props}>{children}</span>,
  },
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

describe("RegisterForm", () => {
  it("renders updated register UX copy, structure, and password strength behavior", async () => {
    const user = userEvent.setup();

    render(<RegisterForm />);

    expect(
      screen.getByText("Create your account to start using the dashboard."),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Full name" })).toHaveAttribute(
      "placeholder",
      "John Doe",
    );
    expect(screen.getByRole("textbox", { name: "Username" })).toHaveAttribute(
      "placeholder",
      "your_username",
    );
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveAttribute(
      "placeholder",
      "john@example.com",
    );

    await user.type(screen.getByLabelText("Password"), "short");

    expect(screen.getByText("Weak")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm password")).toHaveAttribute(
      "placeholder",
      "JohnDoe123!",
    );
    expect(screen.getByRole("link", { name: "Or sign in" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Or sign in" })).toHaveClass(
      "btn",
      "btn-ghost",
      "btn-sm",
      "w-full",
    );
    expect(screen.getByRole("button", { name: "Create account" })).toBeInTheDocument();
  });

  it("renders translated username and password validation errors on separate lines", async () => {
    const user = userEvent.setup();

    render(<RegisterForm />);

    const registerForm = getRegisterForm();
    await user.click(within(registerForm).getByRole("button", { name: "Create account" }));

    expect(
      within(registerForm).getAllByText("Username must be at least 3 characters"),
    ).toHaveLength(1);
    expect(within(registerForm).getAllByText("Password must be at least 12 characters")).toHaveLength(1);
    expect(
      within(registerForm).getAllByText("Password must contain at least one uppercase letter"),
    ).toHaveLength(1);
    expect(
      within(registerForm).getAllByText("Password must contain at least one lowercase letter"),
    ).toHaveLength(1);
    expect(within(registerForm).getAllByText("Password must contain at least one number")).toHaveLength(1);
    expect(
      within(registerForm).getAllByText("Password must contain at least one special character"),
    ).toHaveLength(1);
  });

  it("shows confirm password mismatch error for different values and clears it while typing matching values", async () => {
    const user = userEvent.setup();

    render(<RegisterForm />);

    const registerForm = getRegisterForm();

    await user.type(within(registerForm).getByLabelText("Full name"), "John Doe");
    await user.type(within(registerForm).getByLabelText("Username"), "john_doe");
    await user.type(within(registerForm).getByLabelText("Email"), "john@example.com");
    await user.type(within(registerForm).getByLabelText("Password"), "ValidPassword123!");
    await user.type(
      within(registerForm).getByLabelText("Confirm password"),
      "DifferentPassword123!",
    );

    await user.click(within(registerForm).getByRole("button", { name: "Create account" }));

    expect(within(registerForm).getByText("Passwords do not match")).toBeInTheDocument();

    await user.clear(within(registerForm).getByLabelText("Confirm password"));
    await user.type(within(registerForm).getByLabelText("Confirm password"), "ValidPassword123!");

    await waitFor(() => {
      expect(within(registerForm).queryByText("Passwords do not match")).not.toBeInTheDocument();
    });
  });
});
