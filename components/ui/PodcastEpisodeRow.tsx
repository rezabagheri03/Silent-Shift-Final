"use client";

import Link from "next/link";
import type { Podcast } from "@/lib/types";
import { usePlayer } from "@/components/player/PlayerContext";
import { PlayIcon, PauseIcon, DownloadIcon, TranscriptIcon } from "./Icons";
import { formatPersianDate, truncate } from "@/lib/utils";

/** "30 دقیقه" — never "45:00 دقیقه" */
function formatMinutes(seconds: number): string {
  if (!seconds || seconds <= 0) return "";
  const mins = Math.max(1, Math.round(seconds / 60));
  return `${mins} دقیقه`;
}

// Mobile (Figma 1:1649): 32px bordered squares, radius 6, #52525B border.
// Desktop keeps the original 36px buttons.
const iconBtn =
  "box-border flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border-[0.5px] border-border-medium bg-transparent text-[#A1A1AA] transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 md:h-9 md:w-9 md:rounded-[4px] md:border md:border-white/20 md:text-text-secondary";

export function PodcastEpisodeRow({ podcast }: { podcast: Podcast }) {
  const player = usePlayer();
  const current = player.track?.slug === podcast.slug;
  const playing = current && player.playing;

  function play() {
    if (!podcast.audio_url) return;
    if (current) player.toggle();
    else
      player.play({
        slug: podcast.slug,
        title: podcast.title,
        subtitle: podcast.subtitle,
        src: podcast.audio_url,
        cover_url: podcast.cover_url,
      });
  }

  const episodeNo = podcast.episode_number ?? podcast.id;
  const host = podcast.producer || "برزو ذاکری";
  const durationLabel = formatMinutes(podcast.duration_seconds);

  return (
    <article
      dir="rtl"
      className="group flex flex-col gap-6 border-b border-white/10 py-8 transition-colors md:grid md:grid-cols-[auto_1fr_auto_auto] md:items-center md:gap-8 md:py-10 md:hover:bg-[#C9A84C]/10"
    >
      {/*
        Mobile (Figma 1:1649 "Episode Part/Mobile"): episode label,
        title + description, date + host/duration caption row,
        bottom-centered action cluster. Desktop keeps the original row below.
      */}
      <div className="flex flex-col gap-4 md:hidden">
        <div className="text-base font-normal leading-6 text-[#F5F5F5]">
          اپیزود {episodeNo}
        </div>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex min-w-0 flex-col gap-2 text-right">
            <Link href={`/podcasts/${podcast.slug}`}>
              <h3 className="text-2xl font-medium leading-8 text-white transition-colors hover:text-brand">
                {podcast.title}
              </h3>
            </Link>

            {podcast.description ? (
              <p className="line-clamp-2 text-base font-normal leading-6 text-[#A1A1AA]">
                {truncate(podcast.description, 220)}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm font-normal leading-5 text-[#52525B]">
              <span>{host}</span>
              {durationLabel ? (
                <>
                  <span className="h-1 w-1 shrink-0 rounded-full bg-current" />
                  <span>{durationLabel}</span>
                </>
              ) : null}
            </div>
            <span className="text-base font-normal leading-6 text-[#F5F5F5]">
              {formatPersianDate(podcast.published_at)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <ActionButtons podcast={podcast} playing={playing} onPlay={play} />
        </div>
      </div>

      {/* Desktop row — unchanged */}
      <div className="hidden md:contents">
        {/* Episode number — far right */}
        <div className="text-d-body-md text-text-secondary transition-colors group-hover:text-[#C9A84C] md:min-w-[4.5rem] md:text-right">
          اپیزود {episodeNo}
        </div>

        {/* Title / description / host · duration */}
        <div className="flex min-w-0 flex-col gap-2 text-right">
          <Link href={`/podcasts/${podcast.slug}`}>
            <h3 className="text-d-h5 md:text-d-h4 font-medium text-white transition-colors hover:text-brand">
              {podcast.title}
            </h3>
          </Link>

          {podcast.description ? (
            <p className="text-d-body-sm md:text-d-body-md leading-7 text-text-secondary line-clamp-2">
              {truncate(podcast.description, 220)}
            </p>
          ) : null}

          {/*
            dir=rtl → justify-start pins host + duration to the VISUAL RIGHT
          */}
          <div className="mt-1 flex flex-wrap items-center justify-start gap-2 text-d-body-sm text-text-tertiary transition-colors group-hover:text-[#C9A84C]">
            <span>{host}</span>
            {durationLabel ? (
              <>
                <span className="h-1 w-1 shrink-0 rounded-full bg-current" />
                <span>{durationLabel}</span>
              </>
            ) : null}
          </div>
        </div>

        {/* Date */}
        <div className="text-d-body-sm text-text-tertiary md:min-w-[7rem] md:text-left">
          {formatPersianDate(podcast.published_at)}
        </div>

        {/*
          Actions cluster (far left).
          dir=rtl flex: first child = right side of cluster, last = left side.
          Want visual LEFT → RIGHT: transcript · download · play
          → DOM: play, download, transcript
        */}
        <div className="flex items-center gap-2 md:gap-2.5">
          <ActionButtons podcast={podcast} playing={playing} onPlay={play} />
        </div>
      </div>
    </article>
  );
}

function ActionButtons({
  podcast,
  playing,
  onPlay,
}: {
  podcast: Podcast;
  playing: boolean;
  onPlay: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onPlay}
        disabled={!podcast.audio_url}
        aria-label={playing ? "توقف" : "پخش"}
        className={iconBtn}
      >
        {playing ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
      </button>

      {podcast.audio_url ? (
        <a
          href={podcast.audio_url}
          download
          aria-label="دانلود"
          className={iconBtn}
        >
          <DownloadIcon size={16} />
        </a>
      ) : (
        <span className={`${iconBtn} border-white/10 text-text-tertiary/40`}>
          <DownloadIcon size={16} />
        </span>
      )}

      <Link
        href={`/podcasts/${podcast.slug}#transcript`}
        aria-label="متن اپیزود"
        className={iconBtn}
      >
        <TranscriptIcon size={16} />
      </Link>
    </>
  );
}
