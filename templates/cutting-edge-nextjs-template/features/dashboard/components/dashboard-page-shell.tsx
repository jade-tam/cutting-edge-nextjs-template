import type { ReactNode } from "react";

type DashboardPageShellProps = {
  title: ReactNode;
  description?: ReactNode;
  headerActions?: ReactNode;
  children: ReactNode;
};

export function DashboardPageShell({
  title,
  description,
  headerActions,
  children,
}: DashboardPageShellProps) {
  return (
    <section className="md:space-y-4 space-y-2 mx-auto max-w-7xl pb-4">
      <header className="space-y-2 md:pt-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <h1 className="md:text-3xl text-xl font-semibold">{title}</h1>
            {description ? (
              <p className="text-base-content/70">{description}</p>
            ) : null}
          </div>
          {headerActions ? (
            <div className="shrink-0">{headerActions}</div>
          ) : null}
        </div>
      </header>
      {children}
    </section>
  );
}
