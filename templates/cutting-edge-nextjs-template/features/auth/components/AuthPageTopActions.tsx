"use client";

import { useTranslations } from "next-intl";

import LocaleSwitcher from "@/components/navigation/LocaleSwitcher";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { Link } from "@/i18n/navigation";

export default function AuthPageTopActions() {
  const t = useTranslations("auth");

  return (
    <div
      className="mx-auto flex w-full max-w-7xl justify-end gap-2 px-2 py-2"
      data-testid="auth-top-actions"
    >
      <ThemeToggle />
      <LocaleSwitcher />
      <Link href="/" className="btn btn-ghost gap-2">
        <span className="icon-[fluent--home-24-regular] size-4" aria-hidden="true" />
        {t("actions.returnHome")}
      </Link>
    </div>
  );
}
