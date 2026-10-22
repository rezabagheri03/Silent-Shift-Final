import fs from "node:fs";
import path from "node:path";
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
import VisitTracker from "@/components/ui/VisitTracker";
import { DesignNewsletter } from "@/components/sections/DesignNewsletter";
import { EditorialMosaic } from "@/components/sections/EditorialMosaic";
import { DesignFaqSection } from "@/components/sections/DesignFaqSection";
import { ArticleTitleBlock } from "@/components/ui/ArticleTitleBlock";
import { getArticleBySlug, getRelatedArticles, listArticles } from "@/lib/repos/articles";
import { getPodcastsByCategoryId } from "@/lib/repos/podcasts";
import { listFaqs } from "@/lib/repos/faqs";
import { designAssets } from "@/lib/design-assets";
import { designSrcSet, imageDimensions } from "@/lib/responsive-images";
import { DEFAULT_OG, SITE_URL, absoluteUrl, pageMetadata, toIso } from "@/lib/seo";

export const dynamic = "force-dynamic";

const SITE = SITE_URL;

function articleOg(slug: string, title: string) {
  const relative = `/og/articles/${slug}.jpg`;
  if (!fs.existsSync(path.join(process.cwd(), "public", relative))) return undefined;
  return { url: absoluteUrl(relative), width: 1200, height: 630, alt: title };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();
  return pageMetadata({
    title: article.title,
    description: article.excerpt ?? undefined,
    path: `/articles/${article.slug}`,
    type: "article",
    publishedTime: toIso(article.published_at),
    modifiedTime: toIso(article.updated_at || article.published_at),
    section: article.category_name ?? undefined,
    tags: article.tags?.map((tag) => tag.name),
    image: articleOg(article.slug, article.title),
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();
  const relatedArticles = getRelatedArticles(article.id, 3);
  const mosaicArticles = listArticles({ limit: 2 }).items;
  const faqs = listFaqs();
  const pageUrl = `${SITE}/articles/${article.slug}`;
  const modified = toIso(article.updated_at || article.published_at);
  const ogImage = articleOg(article.slug, article.title) ?? DEFAULT_OG;
  const heroCover = article.cover_url || designAssets.articleStage;
  const [heroWidth, heroHeight] = imageDimensions(heroCover);

  return (
    <PageShell>
      <ArticleViewTracker slug={article.slug} />
      <VisitTracker kind="article" slug={article.slug} title={article.title} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "@id": `${pageUrl}#article`,
            headline: article.title,
            description: article.excerpt || undefined,
            url: pageUrl,
            datePublished: toIso(article.published_at),
            dateModified: modified,
            image: [ogImage.url],
            author: {
              "@type": "Person",
              "@id": `${SITE}/#person`,
              name: article.author || "برزو ذاکری",
              url: `${SITE}/about`,
            },
            publisher: { "@id": `${SITE}/#org` },
            isPartOf: { "@id": `${SITE}/#website` },
            mainEntityOfPage: { "@id": pageUrl },
            articleSection: article.category_name || undefined,
            keywords: article.tags?.map((tag) => tag.name).join(", ") || undefined,
            inLanguage: "fa-IR",
          }).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": pageUrl,
            url: pageUrl,
            name: article.title,
            description: article.excerpt || undefined,
            inLanguage: "fa-IR",
            isPartOf: { "@id": `${SITE}/#website` },
            mainEntity: { "@id": `${pageUrl}#article` },
            primaryImageOfPage: {
              "@type": "ImageObject",
              url: ogImage.url,
              width: ogImage.width,
              height: ogImage.height,
            },
            datePublished: toIso(article.published_at),
            dateModified: modified,
          }).replace(/</g, "\\u003c"),
        }}
      />
      <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "روایت‌ها", href: "/articles" }, { label: article.title }]} />

      <section className="w-full py-10 md:py-14">
        <ArticleTitleBlock article={article} />
      </section>

      <figure dir="ltr" className="w-full overflow-hidden rounded-sm">
        <img
          src={heroCover}
          srcSet={designSrcSet(heroCover)}
          sizes="100vw"
          alt={article.title}
          width={heroWidth}
          height={heroHeight}
          className="block h-[481px] w-full object-cover"
        />
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
          className="!w-[436px] !h-[56px] !min-w-[120px] !rounded !border !border-brand !px-4 hover:!bg-brand hover:!text-brand-on hover:!border-brand"
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

          <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-3">{relatedArticles.map((item) => <ArticleListCard key={item.id} article={item} />)}</div>
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
