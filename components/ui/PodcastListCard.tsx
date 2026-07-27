import Link from "next/link";
import type { Podcast } from "@/lib/types";
import { podcastCover } from "@/lib/design-assets";
import { truncate } from "@/lib/utils";

type Props = { podcast: Podcast };

function formatCardDate(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "short",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function StarIcon({ size = 14 }: { size?: number }) {
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

/**
 * Figma card: 389.33 × 460 · gap 10 · radius 4
 */
export function PodcastListCard({ podcast }: Props) {
  const cover = podcastCover(podcast);
  const dateLabel = formatCardDate(podcast.published_at);
  const producer = podcast.producer || "برزوا ذاکری";
  const category =
    podcast.category_name || podcast.tags?.[0]?.name || "توسعه فردی";
  const excerpt = podcast.summary || podcast.description || podcast.subtitle || "";

  return (
    <article
      dir="rtl"
      className="group relative flex w-full flex-col overflow-hidden md:w-[389.33px] md:shrink-0"
      style={{
        height: 460,
        minHeight: 460,
        borderRadius: 4,
      }}
    >
      {/* Full-bleed cover */}
      <img
        src={cover}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />

      {/* Date — upper left */}
      {dateLabel ? (
        <span
          dir="ltr"
          className="absolute top-3 left-3 z-20 text-[13px] leading-5 text-white/90"
        >
          {dateLabel}
        </span>
      ) : null}

      <Link
        href={`/podcasts/${podcast.slug}`}
        className="absolute inset-0 z-10"
        aria-label={podcast.title}
      />

      {/* Spacer */}
      <div className="relative z-0 flex-1" aria-hidden />

      {/* Glass panel */}
      <div
        className="relative z-20 flex flex-col p-4 md:p-5"
        style={{
          gap: 10,
          background: "rgba(10, 10, 10, 0.45)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        <div className="flex flex-row items-start justify-between gap-3">
          <h3 className="min-w-0 flex-1 text-[18px] font-semibold leading-7 text-white md:text-[20px]">
            <Link
              href={`/podcasts/${podcast.slug}`}
              className="relative z-20 transition-colors hover:text-brand"
            >
              {podcast.title}
            </Link>
          </h3>
          <span className="shrink-0 pt-1 text-[13px] leading-5 text-[#A1A1AA]">
            {producer}
          </span>
        </div>

        {excerpt ? (
          <p className="line-clamp-2 text-[13px] leading-6 text-[#A1A1AA] md:text-[14px]">
            {truncate(
              excerpt
                .replace(/^#{1,6}\s+/gm, "")
                .replace(/[#>*_]+/g, " ")
                .replace(/\s+/g, " ")
                .trim(),
              110
            )}
          </p>
        ) : null}

        {/* category (right) · score (left) */}
        <div className="flex flex-row flex-wrap items-center justify-between gap-2">
          <span
            className="inline-flex items-center px-2.5 py-1 text-[12px] text-[#A1A1AA]"
            style={{
              borderRadius: 4,
              background: "rgba(245, 245, 245, 0.08)",
              border: "0.5px solid rgba(255, 255, 255, 0.12)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
          >
            {category}
          </span>
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] text-[#A1A1AA]"
            style={{
              borderRadius: 4,
              background: "rgba(245, 245, 245, 0.08)",
              border: "0.5px solid rgba(255, 255, 255, 0.12)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
          >
            <StarIcon size={13} />
            امتیاز
          </span>
        </div>

        <Link
          href={`/podcasts/${podcast.slug}`}
          className="flex h-11 w-full items-center justify-center border border-[#C9A84C] text-[14px] text-[#C9A84C] transition-colors hover:bg-[#C9A84C]/10"
          style={{ borderRadius: 4 }}
        >
          مشاهده جزییات اپیزود
        </Link>
      </div>
    </article>
  );
}