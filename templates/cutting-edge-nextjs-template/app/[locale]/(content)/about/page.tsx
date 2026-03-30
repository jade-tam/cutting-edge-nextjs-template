import { setRequestLocale } from "next-intl/server";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-6 py-12">
      <h1 className="text-3xl font-semibold">About this template</h1>
      <p className="text-base-content/70">
        This page is a placeholder for static project content. Replace this copy
        with your own product, team, or company information.
      </p>
    </main>
  );
}
