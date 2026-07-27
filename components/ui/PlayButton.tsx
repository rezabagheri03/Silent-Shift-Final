"use client";

import { usePlayer, type Track } from "@/components/player/PlayerContext";
import { PlayIcon, PauseIcon } from "./Icons";

type Props = {
  track: Track;
  disabled?: boolean;
  size?: "md" | "lg";
  className?: string;
};

/**
 * Standalone play button for use inside podcast detail pages.
 * Reflects the global player state (paused/playing/loading).
 */
export function PlayButton({ track, disabled, size = "md", className = "" }: Props) {
  const p = usePlayer();
  const isCurrent = p.track?.slug === track.slug && p.playing;
  const isLoading = p.track?.slug === track.slug && p.loading;

  const dims = size === "lg" ? "w-16 h-16" : "w-12 h-12";
  const iconSize = size === "lg" ? 22 : 18;

  return (
    <button
      onClick={() => (isCurrent ? p.toggle() : p.play(track))}
      disabled={disabled}
      aria-label={isCurrent ? `توقف ${track.title}` : `شنیدن ${track.title}`}
      className={`${dims} rounded-full bg-brand text-brand-on hover:bg-brand-hover disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center justify-center shrink-0 ${className}`}
    >
      {isLoading ? (
        <span
          className="border-2 border-brand-on border-t-transparent rounded-full animate-spin"
          style={{ width: iconSize, height: iconSize }}
        />
      ) : isCurrent ? (
        <PauseIcon size={iconSize} />
      ) : (
        <PlayIcon size={iconSize} />
      )}
    </button>
  );
}
