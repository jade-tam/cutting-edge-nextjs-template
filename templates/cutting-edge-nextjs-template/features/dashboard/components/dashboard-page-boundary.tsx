import { PageLoading } from "@/components/page-loading";

type DashboardPageBoundaryProps = {
  isPending: boolean;
  loadingText: string;
  children: React.ReactNode;
};

export function DashboardPageBoundary({ isPending, loadingText, children }: DashboardPageBoundaryProps) {
  if (isPending) {
    return <PageLoading text={loadingText} variant="section" />;
  }

  return <>{children}</>;
}
