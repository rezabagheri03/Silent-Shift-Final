"use client";

import { useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/ui/PageShell";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SortFilter } from "@/components/ui/SortFilter";
import { PodcastEpisodeRow } from "@/components/ui/PodcastEpisodeRow";
import { FeaturedPodcastCard } from "@/components/ui/FeaturedPodcastCard";
import { EmptyState, ErrorMessage } from "@/components/ui/EmptyState";
import { PodcastCardSkeleton } from "@/components/ui/Skeleton";
import { PlatformBadges } from "@/components/sections/PlatformBadges";
import { EditorialMosaic } from "@/components/sections/EditorialMosaic";
import { DesignNewsletter } from "@/components/sections/DesignNewsletter";
import { DesignFaqSection } from "@/components/sections/DesignFaqSection";
import { apiGet } from "@/lib/api-client";
import type { Article, Faq, Paginated, Podcast, SortMode, Tag } from "@/lib/types";

type Props = {
  initialList: Paginated<Podcast>;
  initialFeatured: Podcast | null;
  initialTags: Tag[];
  initialArticles: Article[];
  initialFaqs: Faq[];
  initialPage: number;
  initialSort: SortMode;
  initialTag?: string;
};

export default function PodcastPLPClient({
  initialList,
  initialFeatured,
  initialTags,
  initialArticles,
  initialFaqs,
  initialPage,
  initialSort,
  initialTag,
}: Props) {
  const firstRequest = useRef(true);

  const [page, setPage] = useState(initialPage);
  const [sort, setSort] = useState<SortMode>(initialSort);
  const [tag, setTag] = useState<string | undefined>(initialTag);

  const [list, setList] = useState<Paginated<Podcast> | null>(initialList);
  const [items, setItems] = useState<Podcast[]>(initialList.items);
  const [featured] = useState<Podcast | null>(initialFeatured);
  const [tags] = useState<Tag[]>(initialTags);
  const [articles] = useState<Article[]>(initialArticles);
  const [faqs] = useState<Faq[]>(initialFaqs);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset list when sort/tag changes (not when only loading more pages)
  useEffect(() => {
    if (firstRequest.current) {
      firstRequest.current = false;
      return;
    }
    const controller = new AbortController(); // T18: cancel stale filter fetches
    setLoading(true);
    setError(null);
    setPage(1);
    const q = new URLSearchParams({ page: "1", sort, limit: "10" });
    if (tag) q.set("tag", tag);
    apiGet<Paginated<Podcast>>(`/api/podcasts?${q}`, { signal: controller.signal })
      .then((data) => {
        setList(data);
        setItems(data.items);
        setLoading(false);
      })
      .catch((e) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "خطا در دریافت لیست");
        setLoading(false);
      });
    return () => controller.abort();
  }, [sort, tag]);

  // T19: mirror filters/pagination into the URL (shareable links, sane back/refresh).
  // Skips the initial render so unknown query params (e.g. utm_*) survive until interaction.
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

  async function loadMore() {
    if (!list || page >= list.total_pages || loadingMore) return;
    const next = page + 1;
    setLoadingMore(true);
    setError(null);
    try {
      const q = new URLSearchParams({ page: String(next), sort, limit: "10" });
      if (tag) q.set("tag", tag);
      const data = await apiGet<Paginated<Podcast>>(`/api/podcasts?${q}`);
      setList(data);
      setItems((prev) => [...prev, ...data.items]);
      setPage(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا در دریافت لیست");
    } finally {
      setLoadingMore(false);
    }
  }

  const hasMore = !!list && page < list.total_pages;

  return (
    <PageShell>
      <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "پادکست‌ها" }]} />
      <h1 className="sr-only">پادکست‌های سایلنت شیفت</h1>

      {featured && <FeaturedPodcastCard podcast={featured} />}

      <div className="flex flex-col gap-4 pt-2">
        <SortFilter
          tags={tags}
          tag={tag}
          sort={sort}
          onChange={(n) => {
            if ("tag" in n) setTag(n.tag);
            if ("sort" in n && n.sort) setSort(n.sort);
          }}
        />
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <PodcastCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="border-t border-white/10">
          {items.map((p) => (
            <PodcastEpisodeRow key={p.id} podcast={p} />
          ))}
        </div>
      ) : (
        <EmptyState message="هنوز درباره این موضوع چیزی منتشر نکرده‌ایم. شاید این پادکست‌ها برایت جالب باشد…" />
      )}

      {/* نمایش بیشتر — centered like the mock */}
      {hasMore && !loading && (
        <div className="flex justify-center pt-2 pb-4">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="text-d-body-md text-text-secondary underline underline-offset-4 transition-colors hover:text-brand disabled:opacity-50"
          >
            {loadingMore ? "در حال بارگذاری…" : "نمایش بیشتر"}
          </button>
        </div>
      )}

      <PlatformBadges reverseMobile />
      <EditorialMosaic articles={articles} />
      <DesignNewsletter />
      <DesignFaqSection faqs={faqs} />
    </PageShell>
  );
}