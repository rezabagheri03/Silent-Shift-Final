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

const iconBtn =
  "box-border flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] border border-white/20 bg-transparent text-text-secondary transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40";

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
      className="grid grid-cols-1 items-center gap-4 border-b border-white/10 py-8 md:grid-cols-[auto_1fr_auto_auto] md:gap-8 md:py-10"
    >
      {/* Episode number — far right */}
      <div className="text-d-body-md text-text-secondary md:min-w-[4.5rem] md:text-right">
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
        <div className="mt-1 flex flex-wrap items-center justify-start gap-2 text-d-body-sm text-text-tertiary">
          <span>{host}</span>
          {durationLabel ? (
            <>
              <span className="h-1 w-1 shrink-0 rounded-full bg-text-tertiary/80" />
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
        <button
          type="button"
          onClick={play}
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
      </div>
    </article>
  );
}