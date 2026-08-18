import type { Metadata } from "next";
import PodcastPLPClient from "@/components/pages/PodcastPLPClient";
import { listPodcasts, getLatestPodcast } from "@/lib/repos/podcasts";
import { listArticles } from "@/lib/repos/articles";
import { listTags } from "@/lib/repos/tags";
import { listFaqs } from "@/lib/repos/faqs";
import type { SortMode } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "پادکست‌ها",
  description: "اپیزودهای سایلنت شیفت درباره مکث، تغییر آرام، مهاجرت و توسعه فردی.",
  alternates: { canonical: "/podcasts" },
};

export default async function PodcastPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1);
  const sort: SortMode = (Array.isArray(query.sort) ? query.sort[0] : query.sort) === "popular" ? "popular" : "new";
  const tagValue = Array.isArray(query.tag) ? query.tag[0] : query.tag;
  const tag = tagValue?.trim() || undefined;

  return (
    <PodcastPLPClient
      initialList={listPodcasts({ page, sort, tag, limit: 10 })}
      initialFeatured={getLatestPodcast()}
      initialTags={listTags()}
      initialArticles={listArticles({ limit: 5 }).items}
      initialFaqs={listFaqs()}
      initialPage={page}
      initialSort={sort}
      initialTag={tag}
    />
  );
}
