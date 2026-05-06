"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import ProfileEditorForm from "@/features/auth/components/profile/ProfileEditorForm";
import UserProfilePreviewCard from "@/features/auth/components/profile/UserProfilePreviewCard";
import { DashboardPageShell } from "@/features/dashboard/components/dashboard-page-shell";
import { useUserProfile } from "@/lib/auth/hooks/use-user-profile";
import type { UserProfile } from "@/lib/auth/types";

type ProfilePreviewState = Pick<
  UserProfile,
  "fullName" | "displayName" | "username" | "pronouns" | "bio" | "avatarUrl"
>;

function toPreviewState(profile: UserProfile): ProfilePreviewState {
  return {
    fullName: profile.fullName,
    displayName: profile.displayName,
    username: profile.username,
    pronouns: profile.pronouns,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
  };
}

function getFallbackProfile(): UserProfile {
  return {
    userId: "",
    email: "",
    role: "user",
    fullName: "",
    displayName: null,
    username: null,
    avatarUrl: null,
    pronouns: null,
    bio: null,
    lastLoginAt: null,
    isActive: true,
    createdAt: "",
    updatedAt: "",
    metadata: null,
  };
}

export default function DashboardProfilePage() {
  const t = useTranslations();
  const { data } = useUserProfile();

  const profile = useMemo(() => data?.profile ?? getFallbackProfile(), [data]);
  const profilePreview = useMemo(() => toPreviewState(profile), [profile]);
  const [previewState, setPreviewState] = useState<ProfilePreviewState | null>(null);

  const handlePreviewChange = useCallback((nextPreview: ProfilePreviewState) => {
    setPreviewState((prev) => {
      if (
        prev?.fullName === nextPreview.fullName &&
        prev?.displayName === nextPreview.displayName &&
        prev?.username === nextPreview.username &&
        prev?.pronouns === nextPreview.pronouns &&
        prev?.bio === nextPreview.bio &&
        prev?.avatarUrl === nextPreview.avatarUrl
      ) {
        return prev;
      }

      return nextPreview;
    });
  }, []);

  const displayPreview = previewState ?? profilePreview;

  return (
    <DashboardPageShell
      title={t("pages.profile.title")}
      description={t("profile.description")}
    >
      <main className="rounded-box w-full border border-base-300 bg-base-100 p-6">
        <ProfileEditorForm
          initialProfile={profile}
          onPreviewChange={handlePreviewChange}
          previewCard={
            <UserProfilePreviewCard
              fullName={displayPreview.fullName}
              displayName={displayPreview.displayName}
              username={displayPreview.username}
              pronouns={displayPreview.pronouns}
              bio={displayPreview.bio}
              avatarUrl={displayPreview.avatarUrl}
            />
          }
        />
      </main>
    </DashboardPageShell>
  );
}
