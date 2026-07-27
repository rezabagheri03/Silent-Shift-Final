import type { Article, Podcast } from "@/lib/types";

/**
 * Visual fallbacks extracted from the supplied Figma SVG exports.
 * Admin-provided media always wins; these keep seeded/legacy records aligned
 * with the design system without making the CMS dependent on sample assets.
 */
const ARTICLE_COVERS = [
  "/design/ripple.webp",
  "/design/ripple-stone.webp",
  "/design/gold-line.webp",
  "/design/dunes.webp",
  "/design/fog-path.webp",
  "/design/gold-folds.webp",
];

const PODCAST_COVERS = [
  "/design/dunes-alt.webp",
  "/design/coast.webp",
  "/design/ripple-stone.webp",
  "/design/fog-path.webp",
  "/design/gold-line.webp",
];

function stableIndex(value: string | number, length: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.abs(value - 1) % length;
  let hash = 0;
  for (let i = 0; i < String(value).length; i += 1) {
    hash = (hash * 31 + String(value).charCodeAt(i)) >>> 0;
  }
  return hash % length;
}

export function articleCover(article: Pick<Article, "id" | "slug" | "cover_url">): string {
  return article.cover_url || ARTICLE_COVERS[stableIndex(article.slug || article.id, ARTICLE_COVERS.length)];
}

export function podcastCover(podcast: Pick<Podcast, "id" | "slug" | "cover_url">): string {
  return podcast.cover_url || PODCAST_COVERS[stableIndex(podcast.slug || podcast.id, PODCAST_COVERS.length)];
}

export const designAssets = {
  hero: "/design/hero.webp",
  profile: "/design/profile.webp",
  podcastCover: "/design/podcast-cover.webp",
  articleHero: "/design/feature-fog.webp",
  podcastHero: "/design/ripple.webp",
  contactHero: "/design/contact-hero.webp",
  notFound: "/design/not-found.webp",
  articleStage: "/design/article-stage.webp",
  articleBody: "/design/article-grid.webp",
};
