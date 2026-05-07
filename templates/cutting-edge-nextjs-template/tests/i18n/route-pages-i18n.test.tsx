import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  cleanup();
});

import PublicLandingPage from "@/app/[locale]/(public)/page";
import SolutionsPage from "@/app/[locale]/(public)/solutions/page";
import PricingPage from "@/app/[locale]/(public)/pricing/page";
import ContactPage from "@/app/[locale]/(public)/contact/page";
import DashboardPage from "@/app/[locale]/(dashboard)/dashboard/page";
import DashboardSettingsPage from "@/app/[locale]/(dashboard)/dashboard/settings/page";
import DashboardProfilePage from "@/app/[locale]/(dashboard)/dashboard/profile/page";
import ExampleEntitiesPage from "@/app/[locale]/(dashboard)/dashboard/example-entities/page";
import enMessages from "../../messages/en.json";
import viMessages from "../../messages/vi.json";

vi.mock("next-intl/server", () => ({
  setRequestLocale: vi.fn(),
  getTranslations: vi.fn(async () => (key: string) => key),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "vi",
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

vi.mock("@/features/example-entity/components/example-entities-table", () => ({
  default: () => <div data-testid="example-entities-table" />,
}));

vi.mock("@/features/dashboard/components/settings/SettingsPageContent", () => ({
  default: () => (
    <>
      <h1>pages.settings.title</h1>
      <p>pages.settings.description</p>
    </>
  ),
}));

vi.mock("@/components/theme/ThemeToggle", () => ({
  default: () => <button type="button">theme-toggle</button>,
}));

vi.mock("@/lib/auth/hooks/use-user-profile", () => ({
  useUserProfile: () => ({
    data: {
      profile: {
        userId: "u1",
        email: "test@example.com",
        role: "user",
        fullName: "Test User",
        displayName: "Test",
        username: "testuser",
        avatarUrl: null,
        pronouns: null,
        bio: null,
        lastLoginAt: null,
        isActive: true,
        createdAt: "",
        updatedAt: "",
        metadata: null,
      },
    },
  }),
}));

vi.mock("@/features/auth/components/profile/ProfileEditorForm", () => ({
  default: () => <div data-testid="profile-editor-form" />,
}));

vi.mock("@/features/auth/components/profile/UserProfilePreviewCard", () => ({
  default: () => <div data-testid="profile-preview-card" />,
}));

describe("route pages i18n content", () => {
  it("public landing page should render localized heading key", async () => {
    const node = await PublicLandingPage({ params: Promise.resolve({ locale: "vi" }) });
    render(node);

    expect(screen.getByText("pages.public.landing.title")).toBeInTheDocument();
  });

  it("solutions page should render localized heading key", async () => {
    const node = await SolutionsPage({ params: Promise.resolve({ locale: "vi" }) });
    render(node);

    expect(screen.getByText("navigation.solutions")).toBeInTheDocument();
  });

  it("pricing page should render localized heading key", async () => {
    const node = await PricingPage({ params: Promise.resolve({ locale: "vi" }) });
    render(node);

    expect(screen.getByText("navigation.pricing")).toBeInTheDocument();
  });

  it("contact page should render localized heading key", async () => {
    const node = await ContactPage({ params: Promise.resolve({ locale: "vi" }) });
    render(node);

    expect(screen.getByText("navigation.contact")).toBeInTheDocument();
  });

  it("dashboard page should render localized heading key", async () => {
    const node = await DashboardPage();
    render(node);

    expect(screen.getByText("pages.dashboard.title")).toBeInTheDocument();
  });

  it("settings page should render localized heading key", async () => {
    const node = await DashboardSettingsPage();
    render(node);

    expect(screen.getByText("pages.settings.title")).toBeInTheDocument();
    expect(screen.getByText("pages.settings.description")).toBeInTheDocument();
  });

  it("profile page should render localized heading key", () => {
    render(<DashboardProfilePage />);

    expect(screen.getByText("pages.profile.title")).toBeInTheDocument();
    expect(screen.getByText("profile.description")).toBeInTheDocument();
  });

  it("example entities page should render localized heading key", async () => {
    const node = await ExampleEntitiesPage();
    render(node);

    expect(screen.getByText("pages.exampleEntities.title")).toBeInTheDocument();
  });

  it("auth translation keys should exist for form improvements", () => {
    const requiredKeys = [
      "auth.login.description",
      "auth.register.description",
      "auth.forgotPassword.description",
      "auth.fields.password.show",
      "auth.fields.password.hide",
      "auth.fields.confirmPassword.label",
      "auth.fields.confirmPassword.placeholder",
      "auth.validation.showMoreErrors",
      "auth.validation.showLessErrors",
      "auth.validation.passwordStrength.weak",
      "auth.validation.passwordStrength.fair",
      "auth.validation.passwordStrength.good",
      "auth.validation.passwordStrength.strong",
      "auth.actions.backToLogin",
      "auth.actions.orLogin",
      "auth.actions.orRegister",
      "auth.actions.forgotPassword",
      "auth.actions.returnHome",
      "validation.confirmPassword.mismatch",
    ];

    requiredKeys.forEach((key) => {
      const keys = key.split(".");
      let enValue: unknown = enMessages;
      let viValue: unknown = viMessages;

      keys.forEach((k) => {
        enValue = (enValue as Record<string, unknown> | undefined)?.[k];
        viValue = (viValue as Record<string, unknown> | undefined)?.[k];
      });

      expect(enValue, `Missing English key: ${key}`).toBeDefined();
      expect(typeof enValue, `English key ${key} should be a string`).toBe("string");
      expect(viValue, `Missing Vietnamese key: ${key}`).toBeDefined();
      expect(typeof viValue, `Vietnamese key ${key} should be a string`).toBe("string");
    });
  });
});
