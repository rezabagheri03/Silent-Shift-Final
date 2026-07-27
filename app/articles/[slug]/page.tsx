import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/ui/PageShell";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { ArticleListCard } from "@/components/ui/ArticleListCard";
import { HorizontalCarousel } from "@/components/ui/HorizontalCarousel";
import { Markdown } from "@/components/ui/Markdown";
import { ArticleViewTracker } from "@/components/ui/ArticleViewTracker";
import { DesignNewsletter } from "@/components/sections/DesignNewsletter";
import { EditorialMosaic } from "@/components/sections/EditorialMosaic";
import { DesignFaqSection } from "@/components/sections/DesignFaqSection";
import { ArticleTitleBlock } from "@/components/ui/ArticleTitleBlock";
import { getArticleBySlug, getRelatedArticles, listArticles } from "@/lib/repos/articles";
import { getPodcastsByCategoryId } from "@/lib/repos/podcasts";
import { listFaqs } from "@/lib/repos/faqs";
import { designAssets } from "@/lib/design-assets";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "پیدا نشد" };
  return { title: article.title, description: article.excerpt ?? undefined, openGraph: { title: article.title, description: article.excerpt ?? undefined, type: "article", images: [article.cover_url || designAssets.articleStage] } };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();
  const relatedArticles = getRelatedArticles(article.id, 3);
  const mosaicArticles = listArticles({ limit: 2 }).items;
  const faqs = listFaqs();

  return (
    <PageShell>
      <ArticleViewTracker slug={article.slug} />
      <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "روایت‌ها", href: "/articles" }, { label: article.title }]} />

      <section className="w-full py-10 md:py-14">
        <ArticleTitleBlock article={article} />
      </section>

      <figure className="w-full overflow-hidden rounded-sm">
        <img src={article.cover_url || designAssets.articleStage} alt={article.title} className="w-full max-h-[560px] object-cover" />
      </figure>

      <article className="w-full flex flex-col gap-8">
        <h2 className="sr-only">متن روایت</h2>
        {article.excerpt && <p className="text-d-body-lg text-text-primary leading-loose text-right">{article.excerpt}</p>}
        <Markdown content={article.body} />
      </article>

      <div className="flex justify-center">
        <Button
          href="/contact"
          variant="outline"
          className="!w-[436px] !h-[56px] !min-w-[120px] !rounded !border !border-brand !px-4"
        >
          رزرو جلسه رایگان
        </Button>
      </div>
      <DesignNewsletter />

      {relatedArticles.length > 0 && (
        <section dir="ltr" className="flex w-full flex-col gap-8">
          <div className="flex w-full flex-row items-center justify-between gap-4">
            <Link
              href="/articles"
              className="group flex flex-row items-center gap-2 text-[14px] leading-5 text-[#A1A1AA] transition-colors hover:text-brand"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
                className="shrink-0 transition-transform group-hover:-translate-x-0.5"
              >
                <path
                  d="M15 6L9 12l6 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span dir="rtl">تمام روایت‌ها</span>
            </Link>

            <div className="flex flex-row items-center gap-4">
              <h2 className="text-[22px] font-medium leading-8 text-[#C9A84C] md:text-[28px] md:leading-9">
                روایت‌های بیشتر
              </h2>
              <span className="h-[2px] w-14 shrink-0 bg-[#C9A84C] md:w-16" aria-hidden />
            </div>
          </div>

          <div className="hidden md:grid gap-4 md:grid-cols-3">{relatedArticles.map((item) => <ArticleListCard key={item.id} article={item} />)}</div>
          <div className="md:hidden"><HorizontalCarousel ariaLabel="روایت‌های مرتبط" itemMinWidth={364}>{relatedArticles.map((item) => <ArticleListCard key={item.id} article={item} />)}</HorizontalCarousel></div>
        </section>
      )}
      <EditorialMosaic
        articles={mosaicArticles}
        title="پادکست‌های مرتبط"
        eyebrow="پادکست‌های مرتبط"
        backLinkText="تمام پادکست‌ها"
        backLinkHref="/podcasts"
        maxItems={2}
      />
      <DesignFaqSection faqs={faqs} />
    </PageShell>
  );
}
