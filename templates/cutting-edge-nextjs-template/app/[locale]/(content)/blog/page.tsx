import { Link } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";

const postSlugs = ["hello-world", "api-integration", "deployment-notes"];

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-6 py-12">
      <h1 className="text-3xl font-semibold">Blog</h1>
      <p className="text-base-content/70">
        Example content index with locale-aware routing.
      </p>
      <ul className="space-y-2">
        {postSlugs.map((slug) => (
          <li key={slug}>
            <Link href={`/blog/${slug}`} className="link link-primary">
              {slug}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
