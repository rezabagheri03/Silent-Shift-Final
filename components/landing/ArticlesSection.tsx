"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Article } from "@/lib/types";
import { articleCover } from "@/lib/design-assets";
import { formatPersianDate } from "@/lib/utils";
import { CarouselDots } from "@/components/ui/CarouselDots";
import { ArrowUpLeftIcon } from "@/components/ui/Icons";

type Props = {
  articles: Article[];
};

type CardContent = {
  label: string;
  title: string;
  subtitle: string;
  date: string;
  readTime: string;
  image: string;
  href?: string;
};

function ArticleStoryCard({
  label,
  title,
  subtitle,
  date,
  readTime,
  image,
  href = "/articles",
  size = "small",
  className = "",
}: CardContent & { size?: "large" | "small" | "mobile"; className?: string }) {
  const isLarge = size === "large";
  const isMobile = size === "mobile";

  return (
    <Link
      href={href}
      className={`group relative flex h-full w-full flex-col justify-end overflow-hidden rounded-[4px] ${className}`}
      style={{ border: "0.2px solid #C9A84C" }}
    >
      {/* Figma: image fill at 30% opacity (rest) → 40% (hover) */}
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-30 transition-opacity duration-300 group-hover:opacity-40"
        loading="lazy"
      />
      {/* Figma: black 20% overlay (rest) → #3C3C3C 20% (hover) */}
      <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-[#3C3C3C]/20" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      <div
        dir="rtl"
        className={
          isMobile
            ? "relative z-10 flex w-full flex-1 flex-col justify-end gap-[22px] p-6 text-right"
            : "relative z-10 flex w-full flex-col gap-[22px] p-6 text-right"
        }
      >
        <span className="text-[16px] font-normal leading-7 text-[#AA8C2C]">
          — {label}
        </span>

        <div className="flex flex-col gap-[7px]">
          <h3
            className={
              isMobile
                ? "text-[18px] font-medium leading-7 text-white"
                : isLarge
                  ? "text-[24px] font-semibold leading-8 text-white"
                  : "text-[20px] font-medium leading-7 text-white"
            }
          >
            {title}
          </h3>

          <p
            className={
              isMobile
                ? "text-[14px] font-normal leading-5 text-[#52525B]"
                : isLarge
                  ? "text-[16px] font-normal leading-7 text-[#52525B] line-clamp-2"
                  : "text-[14px] font-normal leading-5 text-[#52525B] line-clamp-2"
            }
          >
            {subtitle}
          </p>
        </div>

        {/* Meta row — gold arrow pinned to the LEFT corner; times stay right */}
        <div
          dir="ltr"
          className="hidden w-full flex-row items-center justify-between gap-6 md:flex"
        >
          <ArrowUpLeftIcon
            size={16}
            className="w-0 shrink-0 -translate-x-1 text-[#C9A84C] opacity-0 transition-all duration-200 group-hover:w-4 group-hover:translate-x-0 group-hover:opacity-100"
          />
          <div className="flex flex-row items-center justify-end gap-6">
            <span className="text-[14px] font-normal leading-5 text-[#52525B] flex items-center gap-1">
              <span dir="rtl">دقیقه</span>
              <span>{readTime}</span>
            </span>
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#52525B]" />
            <span className="text-[14px] font-normal leading-5 text-[#52525B]">
              {date}
            </span>
          </div>
        </div>

        {/* Figma mobile meta row: date · dot · read time, no arrow */}
        {isMobile && (
          <div dir="rtl" className="flex w-full flex-row items-center justify-start gap-6">
            <span className="text-[14px] font-normal leading-5 text-[#52525B]">
              {date}
            </span>
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#52525B]" />
            <span className="text-[14px] font-normal leading-5 text-[#52525B]">
              {readTime} دقیقه مطالعه
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function ArticlesSection({ articles }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const cards: CardContent[] = (articles ?? []).slice(0, 3).map((a) => ({
    label: a.category_name || "روایت",
    title: a.title,
    subtitle: a.excerpt || "",
    date: a.published_at ? formatPersianDate(a.published_at) : "",
    readTime: a.read_time_minutes ? String(a.read_time_minutes) : "",
    image: articleCover?.(a) || "/design/ripple.webp",
    href: `/articles/${a.slug}`,
  }));

  const [left, rightTop, rightBottom] = cards;

  const scrollTo = (index: number) => {
    scrollRef.current
      ?.querySelectorAll<HTMLElement>("[data-article-slide]")
      [index]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const center = el.getBoundingClientRect().left + el.clientWidth / 2;
      const slides = Array.from(
        el.querySelectorAll<HTMLElement>("[data-article-slide]")
      );
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
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Guard AFTER all hooks — early-returning before useEffect violated rules-of-hooks
  // (latent crash risk; found by ESLint during audit T33).
  if (!articles || articles.length === 0) return null;

  return (
    <section className="flex w-full flex-col gap-8">
      <div className="relative flex items-center justify-between md:flex-row md:items-end">
        <h2 className="flex-1 text-right text-m-h2 text-text-primary md:w-full md:flex-none md:text-center md:text-d-h2">
          روایت‌ها
        </h2>
        <Link
          href="/articles"
          className="static shrink-0 text-d-body-md text-text-secondary underline transition-colors hover:text-brand md:absolute md:left-0 md:top-1/2 md:-translate-y-1/2"
        >
          تمام روایت‌ها
        </Link>
      </div>

      <div
        dir="ltr"
        className="mx-auto hidden w-full max-w-[1200px] md:grid"
        style={{
          height: 682.5,
          gridTemplateColumns: "631fr 569fr",
          gridTemplateRows: "341.25px 341.25px",
        }}
      >
        <div className="row-span-2 min-h-0 min-w-0">
          <ArticleStoryCard {...left} size="large" className="h-full" />
        </div>
        <div className="min-h-0 min-w-0">
          <ArticleStoryCard {...rightTop} size="small" className="h-full" />
        </div>
        <div className="min-h-0 min-w-0">
          <ArticleStoryCard {...rightBottom} size="small" className="h-full" />
        </div>
      </div>

      <div className="md:hidden overflow-hidden">
        <div
          ref={scrollRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            const center = el.getBoundingClientRect().left + el.clientWidth / 2;
            const slides = Array.from(el.querySelectorAll<HTMLElement>("[data-article-slide]"));
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
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          role="region"
          aria-label="روایت‌ها"
        >
          {cards.map((card, i) => (
            <div
              data-article-slide
              key={i}
              className="w-full shrink-0 snap-center"
              style={{ height: 279 }}
            >
              <div className="mx-auto h-full" style={{ width: 327 }}>
                <ArticleStoryCard
                  {...card}
                  size="mobile"
                  className="h-full"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center" dir="ltr">
          <CarouselDots
            count={cards.length}
            active={activeIdx}
            onSelect={scrollTo}
            label="مقاله"
            variant="figma"
          />
        </div>
      </div>
    </section>
  );
}
