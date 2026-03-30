import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

const postSlugs = ["hello-world", "api-integration", "deployment-notes"];

export function generateStaticParams() {
  return postSlugs.map((slug) => ({ slug }));
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  if (!postSlugs.includes(slug)) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-6 py-12">
      <h1 className="text-3xl font-semibold">{slug}</h1>
      <p className="text-base-content/70">
        This is a placeholder article page. Replace this with your own content
        rendering or data fetching strategy.
      </p>
    </main>
  );
}
