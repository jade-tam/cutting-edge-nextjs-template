"use client";

import { useTranslations } from "next-intl";

import UserAvatar from "@/components/avatar/UserAvatar";

type UserProfilePreviewCardProps = {
  fullName: string;
  displayName: string | null;
  username: string | null;
  pronouns: string | null;
  bio: string | null;
  avatarUrl: string | null;
};

export default function UserProfilePreviewCard(props: UserProfilePreviewCardProps) {
  const t = useTranslations();
  const name = props.displayName?.trim() || props.fullName.trim() || "-";
  const usernameLine = [props.username?.trim(), props.pronouns?.trim()].filter(Boolean).join(" • ");

  return (
    <div className="rounded-box h-[360px] w-[320px] border border-base-300 bg-base-300 px-4 py-6">
      <div className="flex flex-col items-center text-center">
        <UserAvatar
          src={props.avatarUrl}
          fallbackText={name}
          alt={t("profile.avatar.alt")}
          size="lg"
          showOnlineStatus
        />

        <p className="mt-3 text-lg font-semibold line-clamp-1">{name}</p>
        <p className="text-sm opacity-70 line-clamp-1">{usernameLine || "-"}</p>
      </div>

      <p className="mt-5 text-sm line-clamp-5 whitespace-pre-line">
        {props.bio?.trim() || "-"}
      </p>
    </div>
  );
}
