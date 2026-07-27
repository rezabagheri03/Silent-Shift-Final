import type { Metadata } from "next";
import ArticlePLPClient from "@/components/pages/ArticlePLPClient";
import { listArticles } from "@/lib/repos/articles";
import { listTags } from "@/lib/repos/tags";
import { listFaqs } from "@/lib/repos/faqs";
import type { SortMode } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "روایت‌ها",
  description: "روایت‌ها و مقالات Silent Shift",
};

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; sort?: string; tag?: string; q?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const page = Math.max(1, Number(sp.page) || 1);
  const sort: SortMode = sp.sort === "popular" ? "popular" : "new";
  const tag = sp.tag?.trim() || undefined;

  const limit = page === 1 ? 10 : 9;
  const list = listArticles({ page, limit, sort, tag, q: sp.q });
  const featured = page === 1 ? list.items[0] ?? null : null;

  const mosaicArticles = listArticles({ limit: 3 }).items;

  return (
    <ArticlePLPClient
      initialList={list}
      initialFeatured={featured}
      initialTags={listTags()}
      initialMosaicArticles={mosaicArticles}
      initialFaqs={listFaqs()}
      initialPage={page}
      initialSort={sort}
      initialTag={tag}
    />
  );
}