import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageShell } from "@/components/ui/PageShell";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { PodcastEpisodeRow } from "@/components/ui/PodcastEpisodeRow";
import { ArticleListCard } from "@/components/ui/ArticleListCard";
import { getCategoryBySlug } from "@/lib/repos/categories";
import { listPodcasts } from "@/lib/repos/podcasts";
import { listArticles } from "@/lib/repos/articles";
import { SITE_URL, pageMetadata, toIso } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();
  return pageMetadata({
    title: `${category.name}؛ پادکست‌ها و روایت‌ها`,
    description: `پادکست‌ها و روایت‌های Silent Shift در دسته ${category.name} با برزو ذاکری.`,
    path: `/categories/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const podcasts = listPodcasts({ category: category.slug, limit: 100 }).items;
  const articles = listArticles({ category: category.slug, limit: 100 }).items;
  const updated = [...podcasts, ...articles]
    .map((item) => item.updated_at || item.published_at)
    .sort()
    .at(-1);

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "@id": `${SITE_URL}/categories/${category.slug}`,
            url: `${SITE_URL}/categories/${category.slug}`,
            name: `دسته‌بندی ${category.name}`,
            inLanguage: "fa-IR",
            isPartOf: { "@id": `${SITE_URL}/#website` },
            dateModified: toIso(updated),
          }).replace(/</g, "\\u003c"),
        }}
      />
      <Breadcrumb
        items={[
          { label: "خانه", href: "/" },
          { label: "دسته‌بندی‌ها", href: "/categories" },
          { label: category.name },
        ]}
      />
      <SectionTitle as="h1" align="right">{category.name}</SectionTitle>
      <p className="max-w-2xl text-right text-d-body-lg text-text-secondary">
        همه پادکست‌ها و روایت‌های این دسته در یک جا.
      </p>

      {podcasts.length > 0 && (
        <section className="flex w-full flex-col gap-4">
          <h2 className="text-d-h3 text-brand">اپیزودها</h2>
          {podcasts.map((podcast) => <PodcastEpisodeRow key={podcast.id} podcast={podcast} />)}
        </section>
      )}

      {articles.length > 0 && (
        <section className="flex w-full flex-col gap-6">
          <h2 className="text-d-h3 text-brand">روایت‌ها</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => <ArticleListCard key={article.id} article={article} />)}
          </div>
        </section>
      )}

      {podcasts.length === 0 && articles.length === 0 && (
        <p className="text-right text-text-secondary">هنوز محتوایی در این دسته منتشر نشده است.</p>
      )}
    </PageShell>
  );
}
