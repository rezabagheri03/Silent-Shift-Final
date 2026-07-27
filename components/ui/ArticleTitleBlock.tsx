import type { Article } from "@/lib/types";
import { formatPersianDate } from "@/lib/utils";

type ArticleExtra = Article & {
  author?: string | null;
  author_name?: string | null;
  read_time_minutes?: number;
  reading_time?: number;
  reading_time_minutes?: number;
  content?: string | null;
  body?: string | null;
};

function getReadTimeMinutes(article: Article): number {
  const a = article as ArticleExtra;
  const explicit =
    a.read_time_minutes ?? a.reading_time_minutes ?? a.reading_time;
  if (typeof explicit === "number" && explicit > 0) return Math.round(explicit);

  const text = [a.title, a.excerpt, a.content, a.body]
    .filter(Boolean)
    .join(" ")
    .replace(/<[^>]+>/g, " ")
    .trim();
  if (!text) return 8;
  return Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 200));
}

function UserIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.5 19c.8-3.2 3.1-5 6.5-5s5.7 1.8 6.5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 9.5h17" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 3.5v3M16 3.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 8v4.5l3 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Photo: large white title + gold meta row
 * RTL visual order (right → left): author · date · read time
 */
export function ArticleTitleBlock({ article }: { article: Article }) {
  const a = article as ArticleExtra;
  const author = a.author_name || a.author || "برزو ذاکری";
  const date = formatPersianDate(article.published_at);
  const mins = getReadTimeMinutes(article);

  return (
    <header dir="rtl" className="flex w-full flex-col items-center gap-6 text-center md:gap-8">
      <h1 className="max-w-5xl text-[28px] font-bold leading-10 text-white md:text-[40px] md:leading-[56px] lg:text-[48px] lg:leading-[60px]">
        {article.title}
      </h1>

      {/*
        Meta row — photo shows items centered under title.
        Each item: gold icon + gold/muted label
        Order in DOM (RTL): author | date | read time  → appears right-to-left as in photo
      */}
      <ul
        className="flex flex-row flex-wrap items-center justify-center gap-x-8 gap-y-3 md:gap-x-12"
        style={{ color: "#C9A84C" }}
      >
        <li className="inline-flex items-center gap-2 text-[14px] leading-5 md:text-[15px]">
          <UserIcon size={18} />
          <span>{author}</span>
        </li>

        <li className="inline-flex items-center gap-2 text-[14px] leading-5 md:text-[15px]">
          <CalendarIcon size={18} />
          <span>{date}</span>
        </li>

        <li className="inline-flex items-center gap-2 text-[14px] leading-5 md:text-[15px]">
          <ClockIcon size={18} />
          <span dir="rtl">{mins} دقیقه مطالعه</span>
        </li>
      </ul>
    </header>
  );
}