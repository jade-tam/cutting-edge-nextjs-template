import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import DashboardProfilePage from "@/app/[locale]/(dashboard)/dashboard/profile/page";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
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

describe("DashboardProfilePage", () => {
  it("renders inline profile page content", () => {
    render(<DashboardProfilePage />);

    expect(screen.getByText("pages.profile.title")).toBeInTheDocument();
    expect(screen.getByText("profile.description")).toBeInTheDocument();
    expect(screen.getByTestId("profile-editor-form")).toBeInTheDocument();
  });
});
