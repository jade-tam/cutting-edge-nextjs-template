import { PageTransitionShell } from "@/components/transitions/page-transition-shell";
import AuthPageTopActions from "@/features/auth/components/AuthPageTopActions";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthPageTopActions />
      <PageTransitionShell>{children}</PageTransitionShell>
    </>
  );
}
