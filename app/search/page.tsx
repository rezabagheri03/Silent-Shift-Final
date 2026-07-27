"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageShell } from "@/components/ui/PageShell";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ArticleListCard } from "@/components/ui/ArticleListCard";
import { PodcastListCard } from "@/components/ui/PodcastListCard";
import { EmptyState, LoadingBlock, ErrorMessage } from "@/components/ui/EmptyState";
import { SearchIcon } from "@/components/ui/Icons";
import { apiGet } from "@/lib/api-client";
import type { Article, Podcast } from "@/lib/types";

function SearchInner() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = params.get("q") ?? "";
  const [q, setQ] = useState(initial);
  const [results, setResults] = useState<{ podcasts: Podcast[]; articles: Article[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const data = await apiGet<{ podcasts: Podcast[]; articles: Article[] }>(
          `/api/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        setResults(data);
        setError(null);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "خطا");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);
    return () => { clearTimeout(t); controller.abort(); };
  }, [q]);

  return (
    <PageShell>
      <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "جستجو" }]} />
      <SectionTitle as="h1" align="right">جستجو</SectionTitle>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.replace(`/search?q=${encodeURIComponent(q.trim())}`);
        }}
      >
        <div className="flex items-center gap-3 bg-surface border border-border rounded-md px-4 py-3 focus-within:border-brand transition-colors">
          <SearchIcon size={20} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="عبارت جستجو…"
            className="flex-1 bg-transparent outline-none text-d-body-md text-text-primary placeholder:text-text-tertiary text-right"
            aria-label="عبارت جستجو"
            autoFocus
          />
        </div>
      </form>

      {error && <ErrorMessage message={error} />}
      {loading && <LoadingBlock />}

      {!loading && !error && q.trim().length >= 2 && results && results.podcasts.length === 0 && results.articles.length === 0 && (
        <EmptyState message="هنوز درباره این موضوع چیزی منتشر نکرده‌ایم." />
      )}

      {results && results.podcasts.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-d-h4 text-text-primary text-right">پادکست‌ها</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {results.podcasts.map((p) => (
              <PodcastListCard key={p.id} podcast={p} />
            ))}
          </div>
        </section>
      )}

      {results && results.articles.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-d-h4 text-text-primary text-right">روایت‌ها</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.articles.map((a) => (
              <ArticleListCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </PageShell>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<PageShell><LoadingBlock /></PageShell>}>
      <SearchInner />
    </Suspense>
  );
}
