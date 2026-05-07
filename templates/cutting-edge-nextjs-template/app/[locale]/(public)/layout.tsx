import MainNavbar from "@/components/navigation/MainNavbar";
import { PageTransitionShell } from "@/components/transitions/page-transition-shell";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MainNavbar />
      <PageTransitionShell>{children}</PageTransitionShell>
    </>
  );
}
