"use client";

type DashboardClientI18nProviderProps = {
  locale: string;
  children: React.ReactNode;
};

export function DashboardClientI18nProvider({ children }: DashboardClientI18nProviderProps) {
  return <>{children}</>;
}
