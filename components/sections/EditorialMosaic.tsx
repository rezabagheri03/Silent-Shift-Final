"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Article } from "@/lib/types";
import { articleCover } from "@/lib/design-assets";
import { formatPersianDate, truncate } from "@/lib/utils";
import { CarouselDots } from "@/components/ui/CarouselDots";

type ArticleWithReadTime = Article & {
  read_time_minutes?: number;
  reading_time?: number;
  reading_time_minutes?: number;
  content?: string | null;
  body?: string | null;
};

function getReadTimeMinutes(article: Article): number {
  const a = article as ArticleWithReadTime;
  const explicit = a.read_time_minutes ?? a.reading_time_minutes ?? a.reading_time;
  if (typeof explicit === "number" && explicit > 0) return Math.round(explicit);

  const text = [a.title, a.excerpt, a.content, a.body]
    .filter(Boolean)
    .join(" ")
    .replace(/<[^>]+>/g, " ")
    .trim();

  if (!text) return 8;
  return Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 200));
}

function MosaicCard({
  article,
  className = "",
  size = "small",
}: {
  article: Article;
  className?: string;
  size?: "large" | "small";
}) {
  const isLarge = size === "large";
  const category = article.category_name || "روایت ویژه";
  const date = formatPersianDate(article.published_at);
  const mins = getReadTimeMinutes(article);

  return (
    <article
      className={`group relative h-full min-h-0 w-full overflow-hidden bg-black ${className}`}
      style={{
        boxSizing: "border-box",
        border: "0.2px solid #C9A84C",
        borderRadius: 4,
        padding: 24,
      }}
    >
      <img
        src={articleCover(article)}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.88) 100%)",
        }}
      />

      <Link
        href={`/articles/${article.slug}`}
        className="absolute inset-0 z-10"
        aria-label={article.title}
      />

      <div
        dir="rtl"
        className="relative z-0 flex h-full flex-col items-end justify-end"
        style={{ gap: 22, pointerEvents: "none" }}
      >
        <span
          className="w-full"
          style={{
            fontSize: 16,
            lineHeight: "28px",
            fontWeight: 400,
            color: "#AA8C2C",
            textAlign: "right",
          }}
        >
          — {category}
        </span>

        <div className="flex w-full flex-col items-end" style={{ gap: 7 }}>
          <h3
            className="w-full"
            style={{
              margin: 0,
              fontSize: isLarge ? 24 : 20,
              lineHeight: isLarge ? "32px" : "28px",
              fontWeight: isLarge ? 600 : 500,
              color: "#FFFFFF",
              textAlign: "right",
            }}
          >
            {article.title}
          </h3>

          {article.excerpt ? (
            <p
              className="w-full line-clamp-2"
              style={{
                margin: 0,
                fontSize: isLarge ? 16 : 14,
                lineHeight: isLarge ? "28px" : "20px",
                fontWeight: 400,
                color: "#52525B",
                textAlign: "right",
              }}
            >
              {truncate(article.excerpt, isLarge ? 160 : 110)}
            </p>
          ) : null}
        </div>

        <div
          dir="ltr"
          className="flex w-full flex-row items-center justify-end gap-6"
        >
          <span className="text-[14px] font-normal leading-5 text-[#52525B] flex items-center gap-1">
            <span dir="rtl">دقیقه</span>
            <span>{mins}</span>
          </span>
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#52525B]" />
          <span className="text-[14px] font-normal leading-5 text-[#52525B]">
            {date}
          </span>
        </div>
      </div>
    </article>
  );
}

export function EditorialMosaic({
  articles,
  title = "",
  eyebrow = "روایت‌های مرتبط",
  backLinkText = "تمام روایت‌ها",
  backLinkHref = "/articles",
  maxItems = 6,
  hideHeader = false,
}: {
  articles: Article[];
  title?: string;
  eyebrow?: string;
  backLinkText?: string;
  backLinkHref?: string;
  maxItems?: number;
  hideHeader?: boolean;
}) {
  const items = articles.slice(0, maxItems);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const scrollTo = (index: number) => {
    scrollRef.current
      ?.querySelectorAll<HTMLElement>("[data-slide]")
      [index]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
  };

  if (!items.length) return null;

  const slot = (i: number) => items[i] || items[i % items.length];

  return (
    <section className="flex w-full flex-col gap-8">
      {/* Header - golden line + text on RIGHT, back link on LEFT */}
      {!hideHeader ? (
        <div className="relative flex items-end justify-between w-full">
            <div className="flex items-center gap-6">
              <span className="w-14 h-[2px] bg-brand" aria-hidden />
              <span
                className="text-[20px] leading-[28px] font-medium text-brand"
                dir="rtl"
              >
                {title || eyebrow}
              </span>
            </div>
            <Link
              href={backLinkHref}
              className="text-d-body-md text-text-secondary underline transition-colors hover:text-brand flex items-center gap-2"
            >
              <span dir="rtl">{backLinkText}</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M15 6L9 12l6 6"
                  stroke="#52525B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
      ) : null}

      {/* Desktop mosaic */}
      <div className="hidden w-full md:block">
        {items.length <= 2 ? (
          /* 2-card layout */
          <div
            dir="ltr"
            className="grid w-full"
            style={{
              gridTemplateColumns: "706px 494px",
              gridTemplateRows: "432.8px",
              gap: 0,
            }}
          >
            {items[0] && (
              <div style={{ gridColumn: "1", gridRow: "1" }}>
                <MosaicCard article={items[0]} size="large" className="h-full" />
              </div>
            )}
            {items[1] && (
              <div style={{ gridColumn: "2", gridRow: "1" }}>
                <MosaicCard article={items[1]} size="large" className="h-full" />
              </div>
            )}
          </div>
        ) : items.length <= 3 ? (
          /* 3-card layout - like landing page */
          <div
            dir="ltr"
            className="grid w-full"
            style={{
              gridTemplateColumns: "631px 569px",
              gridTemplateRows: "341.25px 341.25px",
              gap: 0,
              height: 682.5,
            }}
          >
            {/* Large card - left, spans 2 rows */}
            <div style={{ gridColumn: "1", gridRow: "1 / 3" }}>
              <MosaicCard article={slot(0)} size="large" className="h-full" />
            </div>

            {/* Right cards - stacked */}
            <div style={{ gridColumn: "2", gridRow: "1" }}>
              <MosaicCard article={slot(1)} size="large" className="h-full" />
            </div>
            <div style={{ gridColumn: "2", gridRow: "2" }}>
              <MosaicCard article={slot(2)} size="large" className="h-full" />
            </div>
          </div>
        ) : (
          /* 6-card layout */
          <>
            {/* Upper section - 2 columns */}
            <div
              dir="ltr"
              className="grid w-full"
              style={{
                gridTemplateColumns: "631px 569px",
                gridTemplateRows: "341.25px 341.25px",
                gap: 0,
              }}
            >
              {/* Large card - left, spans 2 rows */}
              <div style={{ gridColumn: "1", gridRow: "1 / 3" }}>
                <MosaicCard article={slot(0)} size="large" className="h-full" />
              </div>

              {/* Upper right cards - stacked */}
              <div style={{ gridColumn: "2", gridRow: "1" }}>
                <MosaicCard article={slot(1)} size="large" className="h-full" />
              </div>
              <div style={{ gridColumn: "2", gridRow: "2" }}>
                <MosaicCard article={slot(2)} size="large" className="h-full" />
              </div>
            </div>

            {/* Lower section - 3 equal columns */}
            <div
              dir="ltr"
              className="grid w-full"
              style={{
                gridTemplateColumns: "400px 400px 400px",
                gridTemplateRows: "341.25px",
                gap: 0,
                marginTop: 0,
              }}
            >
              <MosaicCard article={slot(3)} size="small" className="h-full" />
              <MosaicCard article={slot(4)} size="small" className="h-full" />
              <MosaicCard article={slot(5)} size="small" className="h-full" />
            </div>
          </>
        )}
      </div>

      {/* Mobile carousel */}
      <div className="md:hidden" style={{ paddingLeft: 24, paddingRight: 24 }}>
        <div
          ref={scrollRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            const center = el.getBoundingClientRect().left + el.clientWidth / 2;
            const slides = Array.from(el.querySelectorAll<HTMLElement>("[data-slide]"));
            let nearest = 0;
            let distance = Number.POSITIVE_INFINITY;
            slides.forEach((slide, index) => {
              const rect = slide.getBoundingClientRect();
              const next = Math.abs(rect.left + rect.width / 2 - center);
              if (next < distance) {
                distance = next;
                nearest = index;
              }
            });
            setActiveIdx(nearest);
          }}
          className="no-scrollbar flex snap-x overflow-x-auto"
          role="region"
          aria-label={title || eyebrow}
        >
          {items.map((article, i) => (
            <div
              data-slide
              key={article.id}
              className="shrink-0 snap-start"
              style={{ height: 410, minWidth: "100%", maxWidth: "100%" }}
            >
              <MosaicCard
                article={article}
                size={i === 0 ? "large" : "small"}
              />
            </div>
          ))}
        </div>
        <CarouselDots
          count={items.length}
          active={activeIdx}
          onSelect={scrollTo}
          label={title || eyebrow}
        />
      </div>
    </section>
  );
}
