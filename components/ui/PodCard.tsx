"use client";

import Link from "next/link";
import type { Podcast } from "@/lib/types";
import { usePlayer } from "@/components/player/PlayerContext";
import { PlayIcon, PauseIcon } from "./Icons";
import { truncate } from "@/lib/utils";

type Props = {
  podcast: Podcast;
  className?: string;
};

/**
 * Compact podcast row: [thumbnail | title + description | play button].
 * Used in the landing "آخرین اپیزود" spot.
 */
export function PodCard({ podcast, className = "" }: Props) {
  const player = usePlayer();
  const isCurrent = player.track?.slug === podcast.slug && player.playing;

  const onPlay = () => {
    if (!podcast.audio_url) return;
    if (isCurrent) {
      player.toggle();
    } else {
      player.play({
        slug: podcast.slug,
        title: podcast.title,
        subtitle: podcast.subtitle,
        src: podcast.audio_url,
        cover_url: podcast.cover_url,
      });
    }
  };

  return (
    <div
      className={`relative bg-surface rounded-md overflow-hidden flex items-center gap-4 p-4 ${className}`}
    >
      <button
        onClick={onPlay}
        disabled={!podcast.audio_url}
        aria-label={isCurrent ? `توقف ${podcast.title}` : `شنیدن ${podcast.title}`}
        className="w-12 h-12 rounded-full bg-brand text-brand-on flex items-center justify-center shrink-0 hover:bg-brand-hover disabled:opacity-40 transition-colors"
      >
        {isCurrent ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
      </button>

      <div className="flex-1 min-w-0 text-right max-w-[751px]">
        <span dir="ltr" className="text-d-body-sm text-brand">
          اپیزود {podcast.episode_number ?? podcast.id}
        </span>
        <Link
          href={`/podcasts/${podcast.slug}`}
          className="block text-d-body-lg text-brand hover:underline line-clamp-1"
        >
          {podcast.title}
        </Link>
        {podcast.description && (
          <p className="text-d-body-sm text-text-secondary line-clamp-1 mt-1">
            {truncate(podcast.description, 120)}
          </p>
        )}
      </div>

      <Link href={`/podcasts/${podcast.slug}`} className="shrink-0" aria-label={podcast.title}>
        <img
          src={podcast.cover_url || "/design/podcast-cover.webp"}
          alt=""
          className="shrink-0 w-[100px] h-[100px] rounded-md object-cover"
        />
      </Link>
    </div>
  );
}
