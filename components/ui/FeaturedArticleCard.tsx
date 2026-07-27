import Link from "next/link";
import type { Article } from "@/lib/types";
import { truncate } from "@/lib/utils";
import { designAssets } from "@/lib/design-assets";

/**
 * Figma Hero Section:
 * 1440×533 · padding 120 · column · align-end
 * Inner block 1200 · gap 24 · align-end
 */
export function FeaturedArticleCard({ article }: { article: Article }) {
  const href = `/articles/${article.slug}`;

  return (
    <article
      className="relative w-full overflow-hidden"
      style={{ minHeight: 533 }}
    >
      {/* Keep design hero asset (not article cover) */}
      <img
        src={designAssets.articleHero}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/35" />

      {/*
        Hero shell — LTR so padding/alignment match Figma frame
        flex-col · items-end · p-[120px]
      */}
      <div
        dir="ltr"
        className="relative mx-auto flex w-full max-w-[1440px] flex-col items-end px-6 py-16 md:px-[120px] md:py-[120px]"
        style={{ minHeight: 533 }}
      >
        {/* Episode / content block — 1200 · gap 24 · items-end */}
        <div
          dir="ltr"
          className="flex w-full max-w-[1200px] flex-col items-end"
          style={{ gap: 24 }}
        >
          {/* Title row: [روایت ویژه][———] packed to the end → line on the RIGHT */}
          <div
            className="flex flex-row items-center justify-end"
            style={{ gap: 24, height: 28 }}
          >
            <span
              className="text-[20px] font-medium leading-7"
              style={{ color: "#C9A84C" }}
            >
              روایت ویژه
            </span>
            <span
              aria-hidden
              className="shrink-0"
              style={{ width: 56, height: 2, background: "#C9A84C" }}
            />
          </div>

          {/* H1 — 48 / 60 · white · right */}
          <Link href={href} className="w-full">
            <h2
              className="w-full text-right font-bold text-white transition-colors hover:opacity-90"
              style={{
                fontSize: "clamp(28px, 4vw, 48px)",
                lineHeight: "1.25",
                color: "#FFFFFF",
              }}
            >
              {article.title}
            </h2>
          </Link>

          {/* Lead — Body LG 20 / 32 · #A1A1AA · right */}
          {article.excerpt ? (
            <p
              className="w-full text-right font-normal"
              style={{
                fontSize: "clamp(16px, 1.4vw, 20px)",
                lineHeight: "32px",
                color: "#A1A1AA",
              }}
            >
              {truncate(article.excerpt, 280)}
            </p>
          ) : null}

          {/* Standard button — 200×56 · #C9A84C · radius 4 · on-primary #000 */}
          <Link
            href={href}
            className="inline-flex shrink-0 items-center justify-center font-medium transition-opacity hover:opacity-90"
            style={{
              width: 200,
              minWidth: 120,
              maxWidth: 200,
              height: 56,
              padding: 16,
              background: "#C9A84C",
              borderRadius: 4,
              color: "#000000",
              fontSize: 16,
              lineHeight: "24px",
            }}
          >
            مطالعه روایت
          </Link>
        </div>
      </div>
    </article>
  );
}