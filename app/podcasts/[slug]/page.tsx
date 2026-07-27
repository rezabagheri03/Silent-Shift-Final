import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/ui/PageShell";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { InlinePlayer } from "@/components/ui/InlinePlayer";
import { PodcastListCard } from "@/components/ui/PodcastListCard";
import { HorizontalCarousel } from "@/components/ui/HorizontalCarousel";
import { MobileCarousel } from "@/components/ui/MobileCarousel";
import { EditorialMosaic } from "@/components/sections/EditorialMosaic";
import { DesignNewsletter } from "@/components/sections/DesignNewsletter";
import { DesignFaqSection } from "@/components/sections/DesignFaqSection";
import { getAdjacentEpisodes, getPodcastBySlug, getRelatedPodcasts } from "@/lib/repos/podcasts";
import { listArticles } from "@/lib/repos/articles";
import { listFaqs } from "@/lib/repos/faqs";
import { designAssets } from "@/lib/design-assets";
import { formatPersianDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

function formatChapterTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

/** Turn markdown-ish summary into plain paragraphs for the design block. */
function summaryParagraphs(raw: string | null | undefined): string[] {
  const fallback = [
    "در دنیایی که مدام ما را به دویدن، تولید کردن و رسیدن تشویق می‌کند، «توقف کردن» اغلب شبیه به یک شکست یا عقب‌ماندگی به نظر می‌رسد. اما واقعیت این است که عمیق‌ترین تغییرات و استراتژیک‌ترین تصمیمات زندگی، نه در هیاهویِ حرکت، بلکه در سکوتِ یک «مکث» شکل می‌گیرند.",
    "در این اپیزود از Silent Shift، به سراغ تله‌ی روانشناختیِ بهره‌وری بی‌وقفه می‌رویم. بررسی می‌کنیم که چرا ذهن ما از فضای خالی می‌ترسد، فرسودگیِ پنهان چگونه در لباسِ موفقیت ظاهر می‌شود و از همه مهم‌تر، چگونه می‌توانیم با طراحی مکث‌های کوتاه و آگاهانه در طول روز، از حالتِ «واکنشِ خودکار» خارج شویم و کنترل فرمانِ زندگی را دوباره در دست بگیریم. این اپیزود دعوتی است برای آرام‌تر شدن، تا بتوانیم مسیر را شفاف‌تر ببینیم.",
  ];

  if (!raw?.trim()) return fallback;

  const plain = raw
    .replace(/\r\n/g, "\n")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .trim();

  const parts = plain
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (parts.length >= 2) return parts;
  if (parts.length === 1) {
    const sentences = parts[0].match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g);
    if (sentences && sentences.length >= 3) {
      return [
        sentences.slice(0, 2).join("").trim(),
        sentences.slice(2).join("").trim(),
      ].filter(Boolean);
    }
    return parts;
  }
  return fallback;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const podcast = getPodcastBySlug(slug);
  if (!podcast) return { title: "پیدا نشد" };
  return {
    title: podcast.title,
    description: podcast.description ?? undefined,
    openGraph: {
      title: podcast.title,
      description: podcast.description ?? undefined,
      type: "article",
      images: [podcast.cover_url || designAssets.podcastCover],
    },
  };
}

export default async function PodcastPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const podcast = getPodcastBySlug(slug);
  if (!podcast) notFound();

  const adjacent = getAdjacentEpisodes(podcast.id, 3);
  const adjacentIds = new Set(adjacent.map((item) => item.id));
  const related = getRelatedPodcasts(podcast.id, 8)
    .filter((item) => !adjacentIds.has(item.id))
    .slice(0, 3);
  const articles = listArticles({ limit: 2 }).items;
  const faqs = listFaqs();
  const chapters = podcast.chapters ?? [];

  const paragraphs = summaryParagraphs(podcast.summary || podcast.description);
  const lead = paragraphs[0] ?? "";
  const rest = paragraphs.slice(1).join("\n\n");

  const quoteText =
    "ما برای پیدا کردن مسیر درست، نیازی به سرعت بیشتر نداریم؛ نیاز به سکوتی داریم تا بتوانیم صدای مسیر را بشنویم.";

  return (
    <PageShell>
      <Breadcrumb
        items={[
          { label: "خانه", href: "/" },
          { label: "پادکست‌ها", href: "/podcasts" },
          { label: podcast.title },
        ]}
      />

      {/* ── Top Hero ── */}
      <section className="relative -mx-6 md:mx-0 overflow-hidden border-y border-border">
        <img
          src={designAssets.podcastHero}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/95 via-black/80 to-black/50" />

        <div className="mx-auto max-w-page px-page-x-m md:px-12 xl:px-page-x-d">
          <div
            dir="ltr"
            className="relative flex min-h-0 flex-row items-center justify-end gap-8 py-9 md:min-h-[619px] md:gap-24"
          >
          <div
            dir="ltr"
            className="hidden min-w-0 max-w-[441px] flex-1 flex-col items-stretch gap-6 md:flex"
          >
            {adjacent.length > 0 && (
              <>
                <h2 className="w-full text-right text-[14px] font-normal leading-5 text-brand">
                  اپیزود‌های اخیر
                </h2>
                <div className="flex w-full flex-col gap-2">
                  {adjacent.slice(0, 3).map((item, index) => {
                    const isFirst = index === 0;
                    return (
                      <Link
                        key={item.id}
                        href={`/podcasts/${item.slug}`}
                        dir="ltr"
                        className="flex w-full flex-row items-start justify-end gap-4 border-b p-2"
                        style={{
                          borderBottomWidth: 0.2,
                          borderBottomColor: isFirst
                            ? "rgba(201, 168, 76, 0.5)"
                            : "rgba(201, 168, 76, 0.1)",
                        }}
                      >
                        <div className="flex min-w-0 flex-1 flex-col items-end gap-2 text-right">
                          <span
                            className={`w-full text-[14px] leading-5 ${
                              isFirst ? "text-white" : "text-text-secondary"
                            }`}
                          >
                            {item.title}
                          </span>
                          {item.duration_seconds > 0 && (
                            <span className="w-full text-[14px] leading-5 text-text-tertiary">
                              {Math.round(item.duration_seconds / 60)} دقیقه
                            </span>
                          )}
                        </div>
                        <span
                          className={`shrink-0 whitespace-nowrap text-[14px] leading-5 ${
                            isFirst ? "text-brand" : "text-text-tertiary"
                          }`}
                        >
                          اپیزود {item.episode_number ?? item.id}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div dir="ltr" className="flex w-full shrink-0 flex-col items-end gap-8 md:w-[663px]">
            <img
              src={podcast.cover_url || designAssets.podcastCover}
              alt={podcast.title}
              className="h-[195px] w-[195px] rounded-lg border border-brand object-cover shadow-[0_0_25px_rgba(201,168,76,0.25)]"
              style={{ borderWidth: 0.5 }}
            />
            <div
              dir="rtl"
              className="flex flex-row items-center gap-2 text-[18px] font-medium leading-6 text-brand"
            >
              <span>اپیزود</span>
              <span>{podcast.episode_number ?? podcast.id}</span>
            </div>
            <h1 className="w-full text-right text-[32px] font-bold leading-10 text-white md:text-[48px] md:leading-[60px]">
              {podcast.title}
            </h1>
            {podcast.tags && podcast.tags.length > 0 && (
              <div dir="rtl" className="flex w-full flex-row flex-wrap items-center justify-start gap-4">
                {podcast.tags.map((tag) => (
                  <Link
                    key={tag.id ?? tag.slug ?? tag.name}
                    href={`/podcasts?tag=${encodeURIComponent(tag.slug ?? tag.name)}`}
                    className="inline-flex items-center justify-center rounded px-2 py-1 text-[14px] leading-5 text-[#A1A1AA]"
                    style={{
                      background: "rgba(245, 245, 245, 0.15)",
                      border: "0.2px solid #C9A84C",
                      borderRadius: 4,
                    }}
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}
            <div className="w-full">
              <InlinePlayer podcast={podcast} />
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Mobile recent */}
      {adjacent.length > 0 && (
        <section className="flex flex-col gap-4 px-6 md:hidden" dir="ltr">
          <h2 className="w-full text-right text-[14px] leading-5 text-brand">اپیزود‌های اخیر</h2>
          <div className="flex w-full flex-col gap-2">
            {adjacent.slice(0, 3).map((item, index) => {
              const isFirst = index === 0;
              return (
                <Link
                  key={item.id}
                  href={`/podcasts/${item.slug}`}
                  dir="ltr"
                  className="flex w-full flex-row items-start justify-end gap-4 border-b p-2"
                  style={{
                    borderBottomWidth: 0.2,
                    borderBottomColor: isFirst
                      ? "rgba(201, 168, 76, 0.5)"
                      : "rgba(201, 168, 76, 0.1)",
                  }}
                >
                  <div className="flex min-w-0 flex-1 flex-col items-end gap-2 text-right">
                    <span
                      className={`w-full text-[14px] leading-5 ${
                        isFirst ? "text-white" : "text-text-secondary"
                      }`}
                    >
                      {item.title}
                    </span>
                    {item.duration_seconds > 0 && (
                      <span className="w-full text-[14px] leading-5 text-text-tertiary">
                        {Math.round(item.duration_seconds / 60)} دقیقه
                      </span>
                    )}
                  </div>
                  <span
                    className={`shrink-0 whitespace-nowrap text-[14px] leading-5 ${
                      isFirst ? "text-brand" : "text-text-tertiary"
                    }`}
                  >
                    اپیزود {item.episode_number ?? item.id}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════
          Episode Text
          [Chapters 297px] gap 64px [Summary flex-1]
         ════════════════════════════════════════════ */}
      <section
        dir="ltr"
        className="flex w-full flex-col items-stretch gap-10 md:flex-row md:items-start md:gap-16"
      >
        {/* ── Chapters / بخش‌ها ── */}
        <aside className="flex w-full shrink-0 flex-col gap-6 md:w-[297px]">
          <div className="flex h-7 w-full flex-row items-center justify-end gap-6">
            <h2 className="text-[20px] font-medium leading-7 text-[#A1A1AA]">بخش‌ها</h2>
            <span className="h-[2px] w-14 shrink-0 bg-[#C9A84C]" aria-hidden />
          </div>

          <ul className="flex w-full flex-col">
            {chapters.length > 0 ? (
              chapters.map((chapter, index) => {
                const isFirst = index === 0;
                return (
                  <li key={chapter.id} className="w-full">
                    <div
                      dir="ltr"
                      className="flex w-full flex-row items-start justify-end gap-4 border-b p-2"
                      style={{
                        borderBottomWidth: 0.2,
                        borderBottomColor: isFirst
                          ? "rgba(201, 168, 76, 0.5)"
                          : "rgba(201, 168, 76, 0.1)",
                      }}
                    >
                      <span
                        dir="ltr"
                        className={`shrink-0 pt-0.5 text-[14px] leading-5 tabular-nums ${
                          isFirst ? "text-white" : "text-[#52525B]"
                        }`}
                      >
                        {formatChapterTime(chapter.start_seconds)}
                      </span>
                      <span
                        dir="rtl"
                        className={`min-w-0 flex-1 text-right text-[14px] leading-5 ${
                          isFirst ? "text-white" : "text-[#A1A1AA]"
                        }`}
                      >
                        {chapter.title}
                      </span>
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="p-2 text-right text-[14px] text-[#52525B]">
                بخش‌بندی ثبت نشده است.
              </li>
            )}
          </ul>
        </aside>

        {/* ── Summary / خلاصه اپیزود ── */}
        <div className="flex min-w-0 flex-1 flex-col items-end">
          <div className="mb-8 flex h-7 w-full flex-row items-center justify-end gap-6">
            <h2 className="text-[20px] font-medium leading-7 text-[#A1A1AA]">خلاصه اپیزود</h2>
            <span className="h-[2px] w-14 shrink-0 bg-[#C9A84C]" aria-hidden />
          </div>

          {lead ? (
            <p className="w-full text-right text-[16px] font-normal leading-7 text-white">
              {lead}
            </p>
          ) : null}

          {rest ? (
            <p className="mt-6 w-full whitespace-pre-line text-right text-[16px] font-normal leading-7 text-[#52525B]">
              {rest}
            </p>
          ) : null}

          <figure className="mt-8 flex w-full max-w-[683px] flex-row items-center gap-[22px] self-end pb-10">
            <blockquote className="flex-1 text-right text-[20px] font-semibold leading-8 text-[#FFEFC4] md:text-[24px] md:leading-8">
              «{quoteText}»
            </blockquote>
            <span className="h-16 w-px shrink-0 bg-[#FFEFC4]" aria-hidden />
          </figure>

          <div className="flex w-full justify-end">
            <span className="h-px w-full max-w-[599px] bg-[#C9A84C]" aria-hidden />
          </div>

          <div className="flex w-full flex-col-reverse items-stretch gap-8 pt-10 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-row flex-wrap items-center gap-3">
              <button
                type="button"
                className="inline-flex h-9 min-w-[100px] items-center justify-center rounded-sm border border-[#C9A84C] px-3 text-[14px] leading-5 text-[#C9A84C] transition-colors hover:bg-[#C9A84C]/10"
              >
                ذخیره
              </button>
              <button
                type="button"
                className="inline-flex h-9 min-w-[100px] items-center justify-center rounded-sm border border-[#C9A84C] px-3 text-[14px] leading-5 text-[#C9A84C] transition-colors hover:bg-[#C9A84C]/10"
              >
                انتشار
              </button>
            </div>

            <div className="flex flex-row items-center justify-end gap-8">
              <div className="flex flex-col items-end gap-6">
                <span className="text-[14px] leading-5 text-[#52525B]">مدت زمان اپیزود</span>
                <span className="text-[14px] leading-5 text-[#A1A1AA]">
                  {podcast.duration_seconds > 0
                    ? `${Math.round(podcast.duration_seconds / 60)} دقیقه`
                    : "—"}
                </span>
              </div>
              <div className="flex flex-col items-end gap-6">
                <span className="text-[14px] leading-5 text-[#52525B]">تاریخ انتشار</span>
                <span className="text-[14px] leading-5 text-[#A1A1AA]">
                  {podcast.published_at ? formatPersianDate(podcast.published_at) : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── More episodes ──
          left:  ‹ تمام اپیزودها
          right: اپیزودهای بیشتر ———
      */}
      {related.length > 0 && (
        <section dir="ltr" className="flex w-full flex-col gap-8">
          <div className="flex w-full flex-row items-center justify-between gap-4">
            <Link
              href="/podcasts"
              className="group flex flex-row items-center gap-2 text-[14px] leading-5 text-[#A1A1AA] transition-colors hover:text-brand"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
                className="shrink-0 transition-transform group-hover:-translate-x-0.5"
              >
                <path
                  d="M15 6L9 12l6 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>تمام اپیزودها</span>
            </Link>

            <div className="flex flex-row items-center gap-4">
              <h2 className="text-[22px] font-medium leading-8 text-[#C9A84C] md:text-[28px] md:leading-9">
                اپیزودهای بیشتر
              </h2>
              <span className="h-[2px] w-14 shrink-0 bg-[#C9A84C] md:w-16" aria-hidden />
            </div>
          </div>

          <div dir="rtl" className="hidden md:flex md:gap-[10px] md:justify-center">
            {related.map((item) => (
              <PodcastListCard key={item.id} podcast={item} />
            ))}
          </div>

          <div className="md:hidden" dir="rtl">
            <MobileCarousel ariaLabel="اپیزودهای بیشتر">
              {related.map((item) => (
                <PodcastListCard key={item.id} podcast={item} />
              ))}
            </MobileCarousel>
          </div>
        </section>
      )}

      <EditorialMosaic
        articles={articles}
        title="از روایت‌ها"
        maxItems={2}
      />
      <DesignNewsletter />
      <DesignFaqSection faqs={faqs} />
    </PageShell>
  );
}