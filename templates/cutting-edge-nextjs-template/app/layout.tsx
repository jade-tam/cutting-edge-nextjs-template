import TanStackQueryProvider from "@/providers/tanstack-query-provider";
import ToastProvider from "@/providers/toast-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TanStackQueryProvider>
      {children}
      <ToastProvider />
    </TanStackQueryProvider>
  );
}
