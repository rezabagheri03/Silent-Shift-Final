"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Podcast } from "@/lib/types";
import { podcastCover } from "@/lib/design-assets";
import { truncate } from "@/lib/utils";
import { CarouselDots } from "@/components/ui/CarouselDots";

export function PodcastMosaic({ podcasts }: { podcasts: Podcast[] }) {
  const items = podcasts.slice(0, 2);
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  if (!items.length) return null;

  const scrollTo = (index: number) => {
    scroller.current
      ?.querySelectorAll<HTMLElement>("[data-podcast-slide]")
      [index]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
  };

  return (
    <section className="flex w-full flex-col">
      {/* Header */}
      <div
        className="flex w-full flex-row items-center justify-between"
        style={{
          paddingLeft: 120,
          paddingRight: 120,
          minHeight: 96,
          gap: 48,
          boxSizing: "border-box",
        }}
      >
        {/* LEFT — تمام روایت‌ها */}
        <Link
          href="/articles"
          className="flex shrink-0 flex-row items-center"
          style={{ gap: 8, height: 24 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M15 6L9 12l6 6"
              stroke="#52525B"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            style={{
              fontSize: 14,
              lineHeight: "20px",
              fontWeight: 400,
              color: "#52525B",
            }}
          >
            تمام روایت‌ها
          </span>
        </Link>

        {/* RIGHT — line at far right, then label; title below */}
        <div
          className="flex min-w-0 flex-1 flex-col items-end justify-center"
          style={{ gap: 24 }}
        >
          {/* dir=ltr so: [text][line] → line stays on the physical RIGHT */}
          <div
            dir="ltr"
            className="flex flex-row items-center"
            style={{ gap: 24, height: 28 }}
          >
            <span
              style={{
                fontSize: 20,
                lineHeight: "28px",
                fontWeight: 500,
                color: "#C9A84C",
                whiteSpace: "nowrap",
              }}
            >
              روایت‌های مرتبط
            </span>
            <span
              style={{
                width: 56,
                height: 2,
                background: "#C9A84C",
                display: "block",
                flexShrink: 0,
              }}
              aria-hidden
            />
          </div>

          <h2
            style={{
              margin: 0,
              width: "100%",
              fontSize: 36,
              lineHeight: "44px",
              fontWeight: 600,
              color: "#FFFFFF",
              textAlign: "right",
            }}
          >
            از روایت‌ها
          </h2>
        </div>
      </div>

      {/* Desktop cards */}
      <div
        className="mx-auto hidden w-full md:block"
        style={{
          maxWidth: 1440,
          paddingLeft: 120,
          paddingRight: 120,
          boxSizing: "border-box",
        }}
      >
        <div
          dir="ltr"
          className="grid w-full"
          style={{
            gridTemplateColumns: "706fr 494fr",
            height: 432.8,
            minHeight: 432.8,
          }}
        >
          {items[0] ? <MosaicCard item={items[0]} size="large" /> : null}
          {items[1] ? <MosaicCard item={items[1]} size="small" /> : null}
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden" style={{ paddingLeft: 24, paddingRight: 24 }}>
        <div
          ref={scroller}
          onScroll={(event) => {
            const el = event.currentTarget;
            const center = el.getBoundingClientRect().left + el.clientWidth / 2;
            const slides = Array.from(
              el.querySelectorAll<HTMLElement>("[data-podcast-slide]")
            );
            let nearest = 0;
            let distance = Infinity;
            slides.forEach((slide, index) => {
              const rect = slide.getBoundingClientRect();
              const next = Math.abs(rect.left + rect.width / 2 - center);
              if (next < distance) {
                distance = next;
                nearest = index;
              }
            });
            setActive(nearest);
          }}
          className="no-scrollbar flex snap-x overflow-x-auto"
          role="region"
          aria-label="از روایت‌ها"
        >
          {items.map((item) => (
            <div
              key={item.id}
              data-podcast-slide
              className="shrink-0 snap-start"
              style={{ height: 410, width: "100%" }}
            >
              <MosaicCard item={item} size="large" />
            </div>
          ))}
        </div>
        <CarouselDots
          count={items.length}
          active={active}
          onSelect={scrollTo}
          label="روایت"
        />
      </div>
    </section>
  );
}

function getTag(item: Podcast): string {
  const anyItem = item as Podcast & {
    category_name?: string | null;
    category?: { name?: string | null } | null;
    tag?: string | null;
  };
  const name =
    anyItem.category_name ||
    anyItem.category?.name ||
    anyItem.tag ||
    item.subtitle ||
    "";
  const cleaned = String(name).replace(/^—\s*/, "").trim();
  return cleaned ? `— ${cleaned}` : "— روایت";
}

function getReadMinutes(item: Podcast): number {
  const anyItem = item as Podcast & {
    read_time_minutes?: number;
    reading_time?: number;
    reading_time_minutes?: number;
  };
  const explicit =
    anyItem.read_time_minutes ??
    anyItem.reading_time_minutes ??
    anyItem.reading_time;
  if (typeof explicit === "number" && explicit > 0) return Math.round(explicit);

  if (item.duration_seconds > 0) {
    return Math.max(1, Math.round(item.duration_seconds / 60));
  }

  const text = `${item.title ?? ""} ${item.description ?? ""}`.trim();
  if (!text) return 8;
  return Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 200));
}

function getDateLabel(item: Podcast): string | null {
  const anyItem = item as Podcast & {
    published_at?: string | null;
    created_at?: string | null;
  };
  const raw = anyItem.published_at ?? anyItem.created_at;
  if (!raw) return null;
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(raw));
  } catch {
    return null;
  }
}

function MosaicCard({
  item,
  size = "small",
}: {
  item: Podcast;
  size?: "large" | "small";
}) {
  const isLarge = size === "large";
  const tag = getTag(item);
  const minutes = getReadMinutes(item);
  const dateLabel = getDateLabel(item);

  return (
    <article
      className="group relative h-full w-full overflow-hidden"
      style={{
        boxSizing: "border-box",
        border: "0.2px solid #C9A84C",
        borderRadius: 4,
        background: "#000",
      }}
    >
      <img
        src={podcastCover(item)}
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
        href={`/podcasts/${item.slug}`}
        className="absolute inset-0 z-10"
        aria-label={item.title}
      />

      <div
        dir="rtl"
        className="relative z-0 flex h-full flex-col items-end justify-end"
        style={{ padding: 24, gap: 22, pointerEvents: "none" }}
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
          {tag}
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
            {item.title}
          </h3>

          {item.description ? (
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
              {truncate(item.description, isLarge ? 160 : 110)}
            </p>
          ) : null}
        </div>

        {/* Meta on the RIGHT: date • N دقیقه مطالعه */}
        <div
          dir="ltr"
          className="flex w-full flex-row items-center justify-end"
          style={{ gap: 24, height: 20 }}
        >
          <span
            style={{
              fontSize: 14,
              lineHeight: "20px",
              fontWeight: 400,
              color: "#52525B",
              whiteSpace: "nowrap",
            }}
          >
            {minutes} دقیقه مطالعه
          </span>

          {dateLabel ? (
            <>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 100,
                  background: "#52525B",
                  display: "block",
                  flexShrink: 0,
                }}
                aria-hidden
              />
              <span
                style={{
                  fontSize: 14,
                  lineHeight: "20px",
                  fontWeight: 400,
                  color: "#52525B",
                  whiteSpace: "nowrap",
                }}
              >
                {dateLabel}
              </span>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}