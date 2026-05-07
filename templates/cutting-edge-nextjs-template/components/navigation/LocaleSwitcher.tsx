"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export default function LocaleSwitcher() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const current = locale.toUpperCase();

  const switchLocale = (nextLocale: "en" | "vi") => {
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <div className="dropdown dropdown-end">
      <button
        type="button"
        tabIndex={0}
        className="btn btn-square btn-ghost relative"
        aria-label={t("languageSwitcher.label")}
        aria-haspopup="menu"
        aria-expanded="false"
        aria-controls="locale-switcher-menu"
      >
        <span
          data-testid="locale-globe-icon"
          className="icon-[fluent--globe-24-regular] text-2xl"
          aria-hidden="true"
        />
        <span className="absolute bottom-1 right-1 text-[0.5rem] font-bold leading-none">
          {current}
        </span>
      </button>

      <ul
        id="locale-switcher-menu"
        tabIndex={0}
        role="menu"
        className="dropdown-content menu menu-sm z-20 mt-2 w-32 rounded-box bg-base-100 p-2 shadow border border-base-300"
      >
        <li>
          <button
            type="button"
            role="menuitem"
            aria-current={locale === "en" ? "true" : undefined}
            className={locale === "en" ? "active" : ""}
            onClick={() => switchLocale("en")}
          >
            {t("languageSwitcher.english")}
          </button>
        </li>
        <li>
          <button
            type="button"
            role="menuitem"
            aria-current={locale === "vi" ? "true" : undefined}
            className={locale === "vi" ? "active" : ""}
            onClick={() => switchLocale("vi")}
          >
            {t("languageSwitcher.vietnamese")}
          </button>
        </li>
      </ul>
    </div>
  );
}
