"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

import UserAvatar from "@/components/avatar/UserAvatar";
import { useSession } from "@/lib/auth/hooks/use-session";
import { useUserProfile } from "@/lib/auth/hooks/use-user-profile";

type UserProfileSectionProps = {
  onLogout: () => void;
  onClose: () => void;
};

export default function UserProfileSection({
  onLogout,
  onClose,
}: UserProfileSectionProps) {
  const t = useTranslations();
  const pathname = usePathname();

  const { data: sessionData } = useSession();
  const { data: profileData } = useUserProfile();

  const profile = profileData?.profile;
  const session = sessionData?.session;

  const username = profile?.username ?? t("dashboardShell.profile.defaultName");
  const email =
    profile?.email ??
    session?.email ??
    t("dashboardShell.profile.defaultEmail");
  const avatar = profile?.avatarUrl;

  // Check if current path is profile or settings page
  const isProfilePage = pathname.endsWith("/dashboard/profile");
  const isSettingsPage = pathname.endsWith("/dashboard/settings");

  return (
    <div className="flex items-center gap-1">
      <div
        className="tooltip grow"
        data-tip={t("dashboardShell.tooltips.userProfile")}
      >
        <Link
          className={`btn flex min-w-0 flex-1 justify-start gap-2 px-2 ${isProfilePage ? "btn-active btn-primary" : ""}`}
          href="/dashboard/profile"
          onClick={onClose}
        >
          <UserAvatar
            src={avatar}
            fallbackText={username}
            alt={t("dashboardShell.profile.avatarAlt")}
            size="sm"
            showOnlineStatus
          />
          <div className="min-w-0 flex-1 text-left">
            <div className="flex gap-2 items-center">
              <p className="truncate text-xs font-medium">{username}</p>
              {/* {role ? (
                <div className="badge badge-primary badge-xs mt-1">{role}</div>
              ) : null} */}
            </div>
            <p className="truncate text-[0.65rem] font-light">{email}</p>
          </div>
        </Link>
      </div>

      <div className="tooltip" data-tip={t("dashboardShell.tooltips.settings")}>
        <Link
          className={`btn btn-square ${isSettingsPage ? "btn-active btn-primary" : ""}`}
          href="/dashboard/settings"
          aria-label={t("dashboardShell.tooltips.settings")}
          onClick={onClose}
        >
          <span className="icon-[fluent--settings-24-regular] text-2xl" />
        </Link>
      </div>

      <div className="tooltip" data-tip={t("dashboardShell.tooltips.logout")}>
        <button
          type="button"
          className="btn btn-square "
          onClick={onLogout}
          aria-label={t("dashboardShell.tooltips.logout")}
        >
          <span className="icon-[fluent--arrow-exit-24-regular] text-2xl" />
        </button>
      </div>
    </div>
  );
}
