import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function MarketingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-5xl flex-col justify-center gap-8 px-6 py-16">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Next.js Boilerplate Template</h1>
        <p className="text-base-content/70">
          A clean App Router starter with i18n, SEO scaffolding, content pages,
          and a CSR dashboard using TanStack Query and TanStack Form.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/about" className="btn btn-primary">
          About
        </Link>
        <Link href="/blog" className="btn btn-outline">
          Blog
        </Link>
        <Link href="/dashboard" className="btn btn-secondary">
          Dashboard
        </Link>
      </div>
    </main>
  );
}
