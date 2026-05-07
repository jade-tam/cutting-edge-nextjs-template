"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { PageLoading } from "@/components/page-loading";

type DashboardClientBootstrapProps = {
  children: React.ReactNode;
};

export function DashboardClientBootstrap({ children }: DashboardClientBootstrapProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.resolve().then(() => {
      if (active) {
        setReady(true);
      }
    });

    return () => {
      active = false;
    };
  }, [locale]);

  if (!ready) {
    return <PageLoading text={t("dashboard.loading.bootstrap")} variant="fullscreen" />;
  }

  return <>{children}</>;
}
