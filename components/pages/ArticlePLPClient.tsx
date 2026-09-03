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
  const [sort, setSort] = useState<SortMode>(initialSort);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialTag ? [initialTag] : []
  );

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
    for (const t of selectedTags) q.append("tag", t);
    apiGet<Paginated<Article>>(`/api/articles?${q}`, { signal: controller.signal })
      .then((data) => { setList(data); setLoading(false); })
      .catch((e) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "خطا در دریافت لیست");
        setLoading(false);
      });
    return () => controller.abort();
  }, [page, sort, selectedTags]);

  // T19: mirror filters/pagination into the URL (shareable links, sane back/refresh)
  const urlSynced = useRef(false);
  useEffect(() => {
    if (!urlSynced.current) { urlSynced.current = true; return; }
    const q = new URLSearchParams();
    if (page > 1) q.set("page", String(page));
    if (sort !== "new") q.set("sort", sort);
    for (const t of selectedTags) q.append("tag", t);
    const qs = q.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [page, sort, selectedTags]);

  const visibleItems = list?.items.filter((article) => article.id !== featured?.id) ?? [];

  // Show 3 cards initially; the button reveals the rest on any screen size
  const [showAllCards, setShowAllCards] = useState(false);
  const shownItems = showAllCards ? visibleItems : visibleItems.slice(0, 6);

  return (
    <PageShell>
      <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "روایت‌ها" }]} />
      <h1 className="sr-only">روایت‌های سایلنت شیفت</h1>

      {featured && <FeaturedArticleCard article={featured} />}

      <div className="flex flex-col gap-4 pt-2">
        <SortFilter
          tags={tags}
          selectedTags={selectedTags}
          sort={sort}
          onChange={(n) => {
            if ("tags" in n && n.tags) setSelectedTags(n.tags);
            else if ("tag" in n) setSelectedTags(n.tag ? [n.tag] : []);
            if ("sort" in n && n.sort) setSort(n.sort);
            setPage(1);
            setShowAllCards(false);
          }}
        />
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3" style={{ columnGap: 16, rowGap: 11 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      ) : visibleItems.length > 0 ? (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3" style={{ columnGap: 16, rowGap: 11 }}>
            {shownItems.map((a) => (
              <div key={a.id}>
                <ArticleListCard article={a} />
              </div>
            ))}
          </div>

          {/* Figma 1:946 Small Button — reveals/hides the remaining cards */}
          {visibleItems.length > 6 && (
            <button
              type="button"
              onClick={() => setShowAllCards((v) => !v)}
              className="mx-auto inline-flex shrink-0 cursor-pointer items-center justify-center border border-[#C9A84C] bg-transparent px-3 py-2 text-[14px] leading-5 text-[#C9A84C] transition-colors hover:bg-[#C9A84C] hover:text-black"
              style={{ borderRadius: 2, minWidth: 101, minHeight: 36 }}
            >
              {showAllCards ? "نمایش کمتر" : "نمایش بیشتر"}
            </button>
          )}
        </>
      ) : (
        <EmptyState message="هنوز درباره این موضوع چیزی منتشر نکرده‌ایم. شاید این روایت‌ها برایت جالب باشد…" />
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
