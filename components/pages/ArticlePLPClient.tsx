"use client";

import { useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/ui/PageShell";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SortFilter } from "@/components/ui/SortFilter";
import { Pagination } from "@/components/ui/Pagination";
import { ArticleListCard } from "@/components/ui/ArticleListCard";
import { FeaturedArticleCard } from "@/components/ui/FeaturedArticleCard";
import { EmptyState, ErrorMessage } from "@/components/ui/EmptyState";
import { ArticleCardSkeleton } from "@/components/ui/Skeleton";
import { EditorialMosaic } from "@/components/sections/EditorialMosaic";
import { DesignNewsletter } from "@/components/sections/DesignNewsletter";
import { DesignFaqSection } from "@/components/sections/DesignFaqSection";
import { apiGet } from "@/lib/api-client";
import type { Article, Faq, Paginated, SortMode, Tag } from "@/lib/types";

type Props = {
  initialList: Paginated<Article>;
  initialFeatured: Article | null;
  initialTags: Tag[];
  initialMosaicArticles: Article[];
  initialFaqs: Faq[];
  initialPage: number;
  initialSort: SortMode;
  initialTag?: string;
};

export default function ArticlePLPClient({ initialList, initialFeatured, initialTags, initialMosaicArticles, initialFaqs, initialPage, initialSort, initialTag }: Props) {
  const firstRequest = useRef(true);
  const [page, setPage] = useState(initialPage);
  const [showAllMobile, setShowAllMobile] = useState(false);
  const [sort, setSort] = useState<SortMode>(initialSort);
  const [tag, setTag] = useState<string | undefined>(initialTag);

  const [list, setList] = useState<Paginated<Article> | null>(initialList);
  const [featured] = useState<Article | null>(initialFeatured);
  const [tags] = useState<Tag[]>(initialTags);
  const [mosaicArticles] = useState<Article[]>(initialMosaicArticles);
  const [faqs] = useState<Faq[]>(initialFaqs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (firstRequest.current) {
      firstRequest.current = false;
      return;
    }
    const controller = new AbortController(); // T18: cancel stale filter fetches
    setLoading(true);
    setError(null);
    const q = new URLSearchParams({ page: String(page), sort, limit: "9" });
    if (tag) q.set("tag", tag);
    apiGet<Paginated<Article>>(`/api/articles?${q}`, { signal: controller.signal })
      .then((data) => { setList(data); setLoading(false); })
      .catch((e) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "خطا در دریافت لیست");
        setLoading(false);
      });
    return () => controller.abort();
  }, [page, sort, tag]);

  // T19: mirror filters/pagination into the URL (shareable links, sane back/refresh)
  const urlSynced = useRef(false);
  useEffect(() => {
    if (!urlSynced.current) { urlSynced.current = true; return; }
    const q = new URLSearchParams();
    if (page > 1) q.set("page", String(page));
    if (sort !== "new") q.set("sort", sort);
    if (tag) q.set("tag", tag);
    const qs = q.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [page, sort, tag]);

  const visibleItems = list?.items.filter((article) => article.id !== featured?.id) ?? [];

  return (
    <PageShell>
      <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "روایت‌ها" }]} />
      <h1 className="sr-only">روایت‌های سایلنت شیفت</h1>

      {featured && <FeaturedArticleCard article={featured} />}

      <div className="flex flex-col gap-4 pt-2">
        <SortFilter
          tags={tags}
          tag={tag}
          sort={sort}
          onChange={(n) => {
            if ("tag" in n) setTag(n.tag);
            if ("sort" in n && n.sort) setSort(n.sort);
            setPage(1);
            setShowAllMobile(false);
          }}
        />
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      ) : visibleItems.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((a, index) => (
            <div key={a.id} className={index >= 3 && !showAllMobile ? "hidden md:block" : "block"}>
              <ArticleListCard article={a} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="هنوز درباره این موضوع چیزی منتشر نکرده‌ایم. شاید این روایت‌ها برایت جالب باشد…" />
      )}

      {visibleItems.length > 3 && (
        <button type="button" onClick={() => setShowAllMobile((value) => !value)} className="md:hidden w-full min-h-12 border border-brand text-brand rounded-md hover:bg-brand/10 transition-colors">
          {showAllMobile ? "نمایش کمتر" : "نمایش بیشتر"}
        </button>
      )}

      {list && list.total_pages > 1 && (
        <Pagination page={list.page} totalPages={list.total_pages} onChange={setPage} />
      )}

      <DesignNewsletter />
      <EditorialMosaic
        articles={mosaicArticles}
        title="از پادکست‌ها"
        eyebrow="پادکست‌های مرتبط"
        backLinkText="تمام پادکست‌ها"
        backLinkHref="/podcasts"
        maxItems={3}
        hideHeader={false}
      />
      <DesignFaqSection faqs={faqs} />
    </PageShell>
  );
}
