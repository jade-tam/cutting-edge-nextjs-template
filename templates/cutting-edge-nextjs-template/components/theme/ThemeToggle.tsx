"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { useTheme } from "@/providers/theme-provider";

const DARK_THEME = "breakingbit";
const LIGHT_THEME = "breakingbit-light";

export default function ThemeToggle() {
  const t = useTranslations("themeSwitcher");
  const { theme, setTheme } = useTheme();

  const nextTheme = useMemo(
    () => (theme === DARK_THEME ? LIGHT_THEME : DARK_THEME),
    [theme],
  );

  const onToggle = () => {
    setTheme(nextTheme);
  };

  const label =
    nextTheme === LIGHT_THEME
      ? t("switchToLight")
      : t("switchToDark");

  return (
    <button
      type="button"
      className="btn btn-ghost btn-square"
      aria-label={label}
      title={label}
      onClick={onToggle}
    >
      {nextTheme === LIGHT_THEME ? (
        <span className="icon-[fluent--weather-sunny-24-regular] text-2xl" />
      ) : (
        <span className="icon-[fluent--weather-moon-24-regular] text-2xl" />
      )}
    </button>
  );
}
