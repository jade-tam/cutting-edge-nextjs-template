import TanStackQueryProvider from "@/providers/tanstack-query-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TanStackQueryProvider>{children}</TanStackQueryProvider>;
}
