"use client";

import Image from "next/image";

type UserAvatarProps = {
  src?: string | null;
  fallbackText: string;
  alt: string;
  size: "sm" | "md" | "lg";
  showOnlineStatus?: boolean;
  className?: string;
};

const AVATAR_SIZE_CLASS: Record<UserAvatarProps["size"], string> = {
  sm: "w-8",
  md: "w-20",
  lg: "w-20",
};

function getFallbackInitial(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "-";
  }

  return trimmed.charAt(0).toUpperCase();
}

export default function UserAvatar({
  src,
  fallbackText,
  alt,
  size,
  showOnlineStatus = false,
  className,
}: UserAvatarProps) {
  const avatarClasses = ["avatar", showOnlineStatus ? "avatar-online" : null, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={avatarClasses}>
      <div className={`${AVATAR_SIZE_CLASS[size]} rounded-full border bg-base-200`}>
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="80px"
            className="rounded-full object-cover"
          />
        ) : (
          <div className="bg-secondary text-secondary-content flex h-full w-full items-center justify-center text-lg font-semibold">
            {getFallbackInitial(fallbackText)}
          </div>
        )}
      </div>
    </div>
  );
}
