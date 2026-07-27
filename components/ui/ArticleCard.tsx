import Link from "next/link";
import type { Article } from "@/lib/types";
import { formatPersianDate, truncate } from "@/lib/utils";
import { articleCover } from "@/lib/design-assets";

type Props = {
  article: Article;
  className?: string;
  readTime?: string;
};

/**
 * Full-bleed image card with bottom gradient overlay.
 * Matches the landing «روایت‌ها» design.
 */
export function ArticleCard({
  article,
  className = "",
  readTime,
}: Props) {
  const href = `/articles/${article.slug}`;
  const date = formatPersianDate(article.published_at);

  return (
    <article
      className={`group relative flex min-h-[460px] flex-col overflow-hidden rounded-lg border border-white/10 bg-black ${className}`}
    >
      <img
        src={articleCover(article)}
        alt={`تصویر روایت ${article.title}`}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />

      <div
        dir="rtl"
        className="relative z-10 mt-auto flex flex-col gap-3 p-5 md:p-6"
      >
        {article.category_name ? (
          <span className="text-d-body-sm text-brand">
            — {article.category_name}
          </span>
        ) : null}

        <Link href={href}>
          <h3 className="text-d-h5 leading-snug text-text-primary transition-colors hover:text-brand">
            {article.title}
          </h3>
        </Link>

        {article.excerpt ? (
          <p className="text-d-body-sm leading-7 text-text-secondary line-clamp-3">
            {truncate(article.excerpt, 160)}
          </p>
        ) : null}

        <div className="mt-1 flex items-center justify-end gap-2 text-d-body-sm text-text-tertiary">
          {readTime ? (
            <>
              <span>{readTime}</span>
              <span className="opacity-60">•</span>
            </>
          ) : null}
          <span>{date}</span>
        </div>
      </div>
    </article>
  );
}