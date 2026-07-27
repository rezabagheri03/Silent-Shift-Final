"use client";

import { usePlayer } from "@/components/player/PlayerContext";
import { formatDuration } from "@/lib/utils";

export type Chapter = { title: string; start_seconds: number };

type Props = {
  chapters: Chapter[];
  podcastSlug?: string;
};

/**
 * Chapter/timestamp list for a podcast episode.
 * If the podcast is currently playing in the global player, clicking a
 * chapter seeks the player to that timestamp.
 */
export function ChaptersList({ chapters, podcastSlug }: Props) {
  const player = usePlayer();
  if (!chapters?.length) return null;

  const handleSeek = (sec: number) => {
    // Only seek if this exact podcast is the current track
    if (podcastSlug && player.track?.slug === podcastSlug) {
      player.seek(sec);
    }
  };

  return (
    <ul className="divide-y divide-border bg-surface border border-border rounded-xl overflow-hidden">
      {chapters.map((c, i) => (
        <li key={i}>
          <button
            type="button"
            onClick={() => handleSeek(c.start_seconds)}
            className="w-full text-right p-4 flex items-center justify-between gap-4 hover:bg-bg/40 transition-colors"
          >
            <span dir="ltr" className="text-d-body-sm text-text-tertiary font-mono shrink-0">
              {formatDuration(c.start_seconds)}
            </span>
            <span className="text-d-body-md text-text-primary flex-1">
              <span className="text-brand ml-2">•</span>
              {c.title}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
