"use client";

import Link from "next/link";
import type { Podcast } from "@/lib/types";
import { usePlayer } from "@/components/player/PlayerContext";
import { PlayIcon, PauseIcon } from "./Icons";
import { truncate } from "@/lib/utils";
import { designAssets } from "@/lib/design-assets";

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

function toPersianMinutes(seconds: number) {
  const minutes = Math.round(seconds / 60);
  return (
    String(minutes)
      .split("")
      .map((d) => PERSIAN_DIGITS[Number(d)] ?? d)
      .join("") + " دقیقه"
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-[18px] h-[18px]"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

export function FeaturedPodcastCard({ podcast }: { podcast: Podcast }) {
  const player = usePlayer();
  const isCurrent = player.track?.slug === podcast.slug && player.playing;
  const isLoading = player.track?.slug === podcast.slug && player.loading;

  const track = {
    slug: podcast.slug,
    title: podcast.title,
    subtitle: podcast.subtitle,
    src: podcast.audio_url || "",
    cover_url: podcast.cover_url,
  };

  return (
    <article className="relative min-h-[390px] md:min-h-[533px] overflow-hidden border-y border-border bg-surface">
      <img
        src={designAssets.podcastHero}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-l from-black/95 via-black/70 to-black/25" />

      <div className="relative min-h-[390px] md:min-h-[533px] flex items-center justify-start px-5 py-10 md:px-[120px]">
        <div className="w-full max-w-[663px] flex flex-col items-start gap-6 text-right">
          {/* Eyebrow */}
          <div className="flex items-center gap-3">
            <span className="w-14 h-[2px] bg-brand/60" />
            <span className="text-d-h5 font-medium text-brand">اپیزود</span>
            <span className="w-2 h-2 rounded-full bg-brand" />
            <span className="text-d-h5 font-medium text-brand">
              {podcast.episode_number ?? podcast.id}
            </span>
          </div>

          <Link href={`/podcasts/${podcast.slug}`}>
            <h2 className="text-m-h1 md:text-d-h1 text-white leading-tight hover:text-brand transition-colors">
              {podcast.title}
            </h2>
          </Link>

          {podcast.description && (
            <p className="max-w-2xl text-d-body-md md:text-d-body-lg text-text-secondary leading-relaxed">
              {truncate(podcast.description, 280)}
            </p>
          )}

          <div className="flex items-center gap-8">
            {/* Single visual pill: entire area is clickable */}
            <button
              type="button"
              onClick={() => (isCurrent ? player.toggle() : player.play(track))}
              disabled={!podcast.audio_url}
              aria-label={isCurrent ? `توقف ${track.title}` : `شنیدن ${track.title}`}
              className="flex items-center gap-2 rounded-md bg-brand h-14 min-w-[160px] px-4 hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isLoading ? (
                <span className="w-[18px] h-[18px] border-2 border-black border-t-transparent rounded-full animate-spin shrink-0" />
              ) : isCurrent ? (
                <PauseIcon size={18} className="text-black shrink-0" />
              ) : (
                <PlayIcon size={18} className="text-black shrink-0" />
              )}
              <span className="text-d-button font-medium text-black">
                {isCurrent ? "توقف" : "پخش کردن"}
              </span>
            </button>

            {podcast.duration_seconds > 0 && (
              <span className="flex items-center gap-2 text-d-body-sm text-text-tertiary">
                <ClockIcon />
                {toPersianMinutes(podcast.duration_seconds)}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}