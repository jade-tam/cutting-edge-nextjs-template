"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import LocaleSwitcher from "@/components/navigation/LocaleSwitcher";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { Link } from "@/i18n/navigation";

export default function MainNavbar() {
  const t = useTranslations("navigation");
  const pathname = usePathname();
  const drawerId = useId();
  const drawerToggleRef = useRef<HTMLInputElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const hideDistanceRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;
    hideDistanceRef.current = 0;

    if (drawerToggleRef.current) {
      drawerToggleRef.current.checked = false;
    }
  }, [pathname]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [pathname]);

  useEffect(() => {
    const topSafeZone = 64;
    const hideThreshold = 24;

    const onScroll = () => {
      if (rafIdRef.current !== null) {
        return;
      }

      rafIdRef.current = window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const previousY = lastScrollYRef.current;
        const delta = currentY - previousY;

        if (currentY <= topSafeZone) {
          hideDistanceRef.current = 0;
          setIsVisible((prev) => (prev ? prev : true));
          lastScrollYRef.current = currentY;
          rafIdRef.current = null;
          return;
        }

        if (delta < 0) {
          hideDistanceRef.current = 0;
          setIsVisible((prev) => (prev ? prev : true));
        } else if (delta > 0) {
          hideDistanceRef.current += delta;
          if (hideDistanceRef.current >= hideThreshold) {
            setIsVisible((prev) => (prev ? false : prev));
          }
        }

        lastScrollYRef.current = currentY;
        rafIdRef.current = null;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const navItems = [
    { id: "solutions", href: "/solutions", label: t("solutions") },
    { id: "pricing", href: "/pricing", label: t("pricing") },
    { id: "contact", href: "/contact", label: t("contact") },
  ] as const;

  return (
    <div className="drawer drawer-end">
      <input
        id={drawerId}
        ref={drawerToggleRef}
        type="checkbox"
        className="drawer-toggle"
      />

      <div className="drawer-content">
        <header
          className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0 pointer-events-none"
          }`}
        >
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="navbar bg-transparent">
              <div className="navbar-start">
                <Link
                  href="/"
                  className="btn btn-ghost text-lg"
                  aria-label={t("home")}
                >
                  {t("home")}
                </Link>
              </div>

              <nav
                className="navbar-center hidden md:flex"
                aria-label={t("mainMenu")}
              >
                <ul className="menu menu-horizontal">
                  {navItems.map((item) => (
                    <li key={item.id}>
                      <Link href={item.href} className="btn btn-ghost btn-sm">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="navbar-end md:hidden">
                <label
                  htmlFor={drawerId}
                  className="btn btn-ghost btn-square"
                  aria-label={t("openMenu")}
                >
                  <span
                    className="icon-[fluent--line-horizontal-3-20-regular] text-2xl"
                    aria-hidden="true"
                  />
                </label>
              </div>

              <div className="navbar-end hidden items-center gap-2 md:flex">
                <ThemeToggle />
                <LocaleSwitcher />
              </div>
            </div>
          </div>
        </header>
      </div>

      <div className="drawer-side z-[60]">
        <label
          htmlFor={drawerId}
          className="drawer-overlay"
          aria-label={t("closeMenu")}
        />

        <aside className="menu min-h-full w-80 bg-base-100 p-4 text-base-content">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium">{t("home")}</span>
            <label
              htmlFor={drawerId}
              className="btn btn-ghost btn-square"
              aria-label={t("closeMenu")}
            >
              <span
                className="icon-[fluent--dismiss-20-regular] text-xl"
                aria-hidden="true"
              />
            </label>
          </div>

          <ul className="menu gap-1 p-0" aria-label={t("mainMenu")}>
            {navItems.map((item) => (
              <li key={`mobile-${item.id}`}>
                <Link href={item.href} className="btn btn-ghost justify-start">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center gap-2">
            <ThemeToggle />
            <LocaleSwitcher />
          </div>
        </aside>
      </div>
    </div>
  );
}
