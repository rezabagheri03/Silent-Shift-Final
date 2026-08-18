"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Article } from "@/lib/types";
import { articleCover } from "@/lib/design-assets";
import { formatPersianDate } from "@/lib/utils";
import { CarouselDots } from "@/components/ui/CarouselDots";

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
}: CardContent & { size?: "large" | "small"; className?: string }) {
  const isLarge = size === "large";

  return (
    <Link
      href={href}
      className={`group relative flex h-full w-full flex-col justify-end overflow-hidden rounded-[4px] ${className}`}
      style={{ border: "0.2px solid #C9A84C" }}
    >
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

      <div
        dir="rtl"
        className="relative z-10 flex w-full flex-col gap-[22px] p-6 text-right"
      >
        <span className="text-[16px] font-normal leading-7 text-[#AA8C2C]">
          — {label}
        </span>

        <div className="flex flex-col gap-[7px]">
          <h3
            className={
              isLarge
                ? "text-[24px] font-semibold leading-8 text-white"
                : "text-[20px] font-medium leading-7 text-white"
            }
          >
            {title}
          </h3>

          <p
            className={
              isLarge
                ? "text-[16px] font-normal leading-7 text-[#52525B] line-clamp-2"
                : "text-[14px] font-normal leading-5 text-[#52525B] line-clamp-2"
            }
          >
            {subtitle}
          </p>
        </div>

        <div
          dir="ltr"
          className="flex w-full flex-row items-center justify-end gap-6"
        >
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
      <div className="relative flex items-end justify-between">
        <h2 className="w-full text-center text-m-h2 text-text-primary md:text-d-h2">
          روایت‌ها
        </h2>
        <Link
          href="/articles"
          className="absolute left-0 top-1/2 -translate-y-1/2 text-d-body-md text-text-secondary underline transition-colors hover:text-brand"
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

      <div className="md:hidden" style={{ paddingLeft: 24, paddingRight: 24 }}>
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
          className="no-scrollbar flex snap-x overflow-x-auto"
          role="region"
          aria-label="روایت‌ها"
        >
          {cards.map((card, i) => (
            <div
              data-article-slide
              key={i}
              className="w-full shrink-0 snap-start"
              style={{ height: 410, paddingRight: 16 }}
            >
              <ArticleStoryCard
                {...card}
                size={i === 0 ? "large" : "small"}
                className="h-full"
              />
            </div>
          ))}
        </div>
        <CarouselDots
          count={cards.length}
          active={activeIdx}
          onSelect={scrollTo}
          label="مقاله"
        />
      </div>
    </section>
  );
}
