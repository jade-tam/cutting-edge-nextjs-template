import { setRequestLocale } from "next-intl/server";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <p className="text-base-content/70">
        This area demonstrates CSR management patterns. Current locale: {locale}
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <article className="card bg-base-100 p-4 shadow">
          <h2 className="text-lg font-semibold">TanStack Query</h2>
          <p className="text-sm text-base-content/70">
            Server-state caching and invalidation.
          </p>
        </article>
        <article className="card bg-base-100 p-4 shadow">
          <h2 className="text-lg font-semibold">TanStack Form</h2>
          <p className="text-sm text-base-content/70">
            Form state and validation orchestration.
          </p>
        </article>
        <article className="card bg-base-100 p-4 shadow">
          <h2 className="text-lg font-semibold">REST API Layer</h2>
          <p className="text-sm text-base-content/70">
            Endpoint integration through typed API helpers.
          </p>
        </article>
      </div>
    </section>
  );
}
