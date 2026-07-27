import Link from "next/link";
import type { Article } from "@/lib/types";
import { articleCover } from "@/lib/design-assets";
import { truncate } from "@/lib/utils";

type Props = { article: Article };

function formatCardDate(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function getReadTimeMinutes(article: Article): number {
  // Use the stored value if available
  if (typeof article.read_time_minutes === "number" && article.read_time_minutes > 0) {
    return Math.round(article.read_time_minutes);
  }

  // Estimate from the article body
  const text = [article.title, article.excerpt, article.body]
    .filter(Boolean)
    .join(" ")
    .replace(/<[^>]+>/g, " ")
    .trim();
  if (!text) return 1;
  return Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 200));
}

function StarIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8 6.8 19.5l1-5.8L3.6 9.6l5.8-.8L12 3.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookmarkIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 4.5h10a1 1 0 0 1 1 1V20l-6-3.5L6 20V5.5a1 1 0 0 1 1-1z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const chipStyle: React.CSSProperties = {
  padding: "4px 8px",
  gap: 8,
  background: "rgba(245, 245, 245, 0.15)",
  border: "none",
  borderRadius: 4,
  color: "#A1A1AA",
  fontSize: 14,
  lineHeight: "20px",
};

/**
 * Desktop card ~389×460
 * - Read time bottom-LEFT of image
 * - Chips: no gold border
 * - Bottom glass panel grows with content (no clip)
 */
export function ArticleListCard({ article }: Props) {
  const href = `/articles/${article.slug}`;
  const cover = articleCover(article);
  const dateLabel = formatCardDate(article.published_at);
  const mins = getReadTimeMinutes(article);
  const author = article.author || "برزو ذاکری";
  const category =
    article.category_name || article.tags?.[0]?.name || "توسعه فردی";
  const excerpt = article.excerpt || "";

  return (
    <article
      className="relative flex w-full flex-col overflow-hidden"
      style={{
        minHeight: 460,
        borderRadius: 4,
      }}
    >
      {/* Background */}
      <img
        src={cover}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />

      {/* ── Image / top zone ── */}
      <div className="relative z-10 flex min-h-[200px] flex-1 flex-col">
        {/* Top row: date LEFT · bookmark RIGHT */}
        <div
          dir="ltr"
          className="flex flex-row items-start justify-between"
          style={{ padding: 16 }}
        >
          <span className="text-[14px] font-normal leading-5 text-white">
            {dateLabel}
          </span>

          <button
            type="button"
            aria-label="ذخیره"
            className="flex shrink-0 items-center justify-center transition-opacity hover:opacity-80"
            style={{
              width: 40,
              height: 40,
              padding: 8,
              borderRadius: 100,
              background: "rgba(245, 245, 245, 0.15)",
              color: "#A1A1AA",
            }}
          >
            <BookmarkIcon size={24} />
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" aria-hidden />

        {/* Read time — bottom LEFT of image, number on RIGHT side of دقیقه */}
        <div className="flex flex-row justify-start" style={{ padding: "0 16px 16px" }}>
          <span dir="ltr" className="text-[14px] font-normal leading-5 text-white">{mins}</span>
          <span className="text-[14px] font-normal leading-5 text-white"> دقیقه</span>
        </div>
      </div>

      {/* ── Glass bottom — auto height, never clipped ── */}
      <div
        dir="rtl"
        className="relative z-10 flex w-full flex-col"
        style={{
          padding: 16,
          gap: 16,
          background: "rgba(23, 23, 23, 0.6)",
          backdropFilter: "blur(9px)",
          WebkitBackdropFilter: "blur(9px)",
        }}
      >
        {/* Title + author */}
        <div className="flex w-full flex-row items-start justify-between gap-3">
          <h3 className="min-w-0 flex-1 text-right text-[20px] font-medium leading-7 text-white">
            <Link href={href} className="transition-colors hover:text-brand">
              {article.title}
            </Link>
          </h3>
          <span className="shrink-0 pt-1 text-right text-[14px] font-normal leading-5 text-white">
            {author}
          </span>
        </div>

        {excerpt ? (
          <p className="w-full text-right text-[14px] font-normal leading-5 text-[#A1A1AA] line-clamp-2">
            {truncate(excerpt.replace(/\s+/g, " ").trim(), 100)}
          </p>
        ) : null}

        {/* Chips — no gold border */}
        <div className="flex w-full flex-row flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center justify-center gap-2" style={chipStyle}>
            {category}
          </span>
          <span className="inline-flex items-center justify-center gap-2" style={chipStyle}>
            <StarIcon size={18} />
            امتیاز
          </span>
        </div>

        {/* CTA */}
        <Link
          href={href}
          className="flex w-full shrink-0 items-center justify-center font-medium transition-colors hover:bg-[#C9A84C]/10"
          style={{
            minHeight: 56,
            height: 56,
            padding: 16,
            border: "1px solid #C9A84C",
            borderRadius: 4,
            color: "#C9A84C",
            fontSize: 16,
            lineHeight: "24px",
          }}
        >
          خواندن مقاله
        </Link>
      </div>
    </article>
  );
}
