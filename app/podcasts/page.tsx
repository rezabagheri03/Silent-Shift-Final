import type { Metadata } from "next";
import PodcastPLPClient from "@/components/pages/PodcastPLPClient";
import { listPodcasts, getLatestPodcast } from "@/lib/repos/podcasts";
import { listArticles } from "@/lib/repos/articles";
import { listTags } from "@/lib/repos/tags";
import { listFaqs } from "@/lib/repos/faqs";
import type { SortMode } from "@/lib/types";
import { PODCAST_COVER, SITE_URL, pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const query = await searchParams;
  const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1);
  const filtered = Boolean(query.tag || query.q || query.sort);
  return pageMetadata({
    title: page > 1 ? `پادکست‌ها — صفحه ${page}` : "پادکست‌ها",
    description: "اپیزودهای سایلنت شیفت درباره مکث، تغییر آرام، مهاجرت و توسعه فردی.",
    path: page > 1 && !filtered ? `/podcasts?page=${page}` : "/podcasts",
  });
}

export default async function PodcastPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1);
  const sort: SortMode = (Array.isArray(query.sort) ? query.sort[0] : query.sort) === "popular" ? "popular" : "new";
  const tagValues = Array.isArray(query.tag) ? query.tag : query.tag ? [query.tag] : [];
  const tags = tagValues.map((t) => t.trim()).filter(Boolean);
  const tag = tags[0];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "PodcastSeries",
            "@id": `${SITE_URL}/podcasts#series`,
            name: "Silent Shift",
            alternateName: "سایلنت شیفت",
            url: `${SITE_URL}/podcasts`,
            webFeed: `${SITE_URL}/rss.xml`,
            image: PODCAST_COVER,
            inLanguage: "fa-IR",
            author: { "@id": `${SITE_URL}/#person` },
            publisher: { "@id": `${SITE_URL}/#org` },
          }).replace(/</g, "\\u003c"),
        }}
      />
      <PodcastPLPClient
        initialList={listPodcasts({ page, sort, tags, limit: 10 })}
        initialFeatured={getLatestPodcast()}
        initialTags={listTags()}
        initialArticles={listArticles({ limit: 5 }).items}
        initialFaqs={listFaqs()}
        initialPage={page}
        initialSort={sort}
        initialTag={tag}
      />
    </>
  );
}
