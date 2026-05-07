"use client";

type DashboardAuthGuardProps = {
  locale: string;
  children: React.ReactNode;
};

export function DashboardAuthGuard({ children }: DashboardAuthGuardProps) {
  return <>{children}</>;
}
