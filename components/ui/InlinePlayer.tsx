"use client";

import { useEffect, useState } from "react";
import type { Podcast } from "@/lib/types";
import { usePlayer } from "@/components/player/PlayerContext";
import { PlayIcon, PauseIcon, DownloadIcon } from "./Icons";
import { formatDuration } from "@/lib/utils";

export function InlinePlayer({ podcast }: { podcast: Podcast }) {
  const player = usePlayer();
  const [localTime, setLocalTime] = useState(0);
  const [localDuration, setLocalDuration] = useState(podcast.duration_seconds || 0);

  const current = player.track?.slug === podcast.slug;
  const time = current ? player.currentTime : localTime;
  const duration = current ? player.duration || podcast.duration_seconds : localDuration;
  const remaining = Math.max(0, duration - time);
  const progress = duration > 0 ? Math.min(100, (time / duration) * 100) : 0;

  useEffect(() => {
    if (!current) return;
    setLocalTime(player.currentTime);
    if (player.duration) setLocalDuration(player.duration);
  }, [current, player.currentTime, player.duration]);

  function toggle() {
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

  function jump(delta: number) {
    const target = Math.max(0, Math.min(duration || Number.MAX_SAFE_INTEGER, time + delta));
    if (current) player.seek(target);
    else setLocalTime(target);
  }

  function seek(clientX: number, element: HTMLElement) {
    if (!duration) return;
    const rect = element.getBoundingClientRect();
    const ratio = (rect.right - clientX) / rect.width;
    const target = Math.max(0, Math.min(1, ratio)) * duration;
    if (current) player.seek(target);
    else setLocalTime(target);
  }

  return (
    <div className="flex w-full flex-col gap-8" style={{ direction: "ltr" }}>
      {/* Progress + times */}
      <div className="flex w-full flex-col gap-2">
        <div
          role="slider"
          aria-label="پیشرفت پخش"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration || 0)}
          aria-valuenow={Math.round(time)}
          aria-valuetext={`${formatDuration(time)} از ${formatDuration(duration || 0)}`}
          tabIndex={0}
          onClick={(e) => seek(e.clientX, e.currentTarget)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              e.preventDefault();
              jump(5);
            }
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              jump(-5);
            }
          }}
          className="relative flex h-6 w-full cursor-pointer items-center"
        >
          {/* T20: 24px hit area; the visible 4px track is unchanged */}
          <div className="relative h-1 w-full bg-text-tertiary">
            <span
              className="absolute top-0 right-0 h-full bg-brand"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex w-full flex-row items-center justify-between text-[14px] leading-5 text-white">
          <span>{formatDuration(time)}</span>
          <span>−{formatDuration(remaining)}</span>
        </div>
      </div>

      {/* Controls: [10] [play] [30] ........ [download] */}
      <div className="flex w-full flex-col items-center gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-row items-center gap-8">
          <button
            type="button"
            onClick={() => jump(-10)}
            aria-label="۱۰ ثانیه عقب"
            className="flex h-11 w-11 items-center justify-center opacity-80 transition-opacity hover:opacity-100"
          >
            <img
              src="/icons/10 Sec Backward.svg"
              alt=""
              width={24}
              height={24}
              className="h-6 w-6"
            />
          </button>

          <button
            type="button"
            onClick={toggle}
            disabled={!podcast.audio_url}
            aria-label={current && player.playing ? "توقف" : "پخش"}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-brand-on transition-colors hover:bg-brand-hover disabled:opacity-40"
          >
            {current && player.loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-on border-t-transparent" />
            ) : current && player.playing ? (
              <PauseIcon size={24} />
            ) : (
              <PlayIcon size={24} />
            )}
          </button>

          <button
            type="button"
            onClick={() => jump(30)}
            aria-label="۳۰ ثانیه جلو"
            className="flex h-11 w-11 items-center justify-center opacity-80 transition-opacity hover:opacity-100"
          >
            <img
              src="/icons/30 Sec Forward.svg"
              alt=""
              width={24}
              height={24}
              className="h-6 w-6"
            />
          </button>
        </div>

        <div className="flex w-full justify-start md:w-auto md:justify-end">
          {podcast.audio_url ? (
            <a
              href={podcast.audio_url}
              download
              aria-label="دانلود اپیزود"
              title="دانلود اپیزود"
              className="flex h-11 w-11 shrink-0 items-center justify-center text-text-tertiary transition-colors hover:text-brand"
            >
              <DownloadIcon size={20} />
            </a>
          ) : (
            <span className="h-11 w-11 shrink-0" aria-hidden />
          )}
        </div>
      </div>

      {current && player.error && (
        <p className="text-center text-d-body-sm text-red-400" role="status">
          {player.error}
        </p>
      )}
    </div>
  );
}