import type { Metadata } from "next";

/** Canonical origin, without a trailing slash. */
export const SITE_URL = (() => {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || "https://silentshift.life";
  try {
    return new URL(configured).origin;
  } catch {
    return "https://silentshift.life";
  }
})();

/**
 * One raster 1200x630 card for every page. Episode/article art is SVG/WebP,
 * which Meta/LinkedIn/Telegram previews do not reliably render — so shares
 * always fall back to this JPEG.
 */
export const DEFAULT_OG = {
  url: `${SITE_URL}/og/default.jpg`,
  width: 1200,
  height: 630,
  alt: "Silent Shift",
} as const;

export const PODCAST_COVER = `${SITE_URL}/og/podcast-cover-3000.png`;

/** Absolute URL for a site-relative path; passes absolute URLs through. */
export function absoluteUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  return `${SITE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
}

/** Normalise a DB timestamp to ISO 8601 (SQLite may hand back "YYYY-MM-DD HH:MM:SS"). */
export function toIso(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const d = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

/** 3600 -> "PT1H", 90 -> "PT1M30S" (schema.org duration). */
export function isoDuration(totalSeconds: number): string | undefined {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return undefined;
  const s = Math.floor(totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}${sec || (!h && !m) ? `${sec}S` : ""}`;
}

type PageMeta = {
  title: string;
  description?: string;
  /** Site-relative path, e.g. "/podcasts" */
  path: string;
  /** Home page keeps its full standalone title instead of the "%s | Silent Shift" template. */
  absoluteTitle?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  section?: string;
  tags?: string[];
};

/** Page metadata with canonical, og:url and Twitter fields that actually match the page. */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle,
  type = "website",
  publishedTime,
  section,
  tags,
}: PageMeta): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: `${SITE_URL}${path}`,
      types: { "application/rss+xml": "/rss.xml" },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      type,
      siteName: "Silent Shift",
      locale: "fa_IR",
      images: [DEFAULT_OG],
      ...(publishedTime ? { publishedTime } : {}),
      ...(section ? { section } : {}),
      ...(tags?.length ? { tags } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG.url],
    },
  };
}
