"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { usePlayer } from "./PlayerContext";
import { formatDuration } from "@/lib/utils";
import { PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon, CloseIcon } from "@/components/ui/Icons";

export default function Player() {
  const player = usePlayer();
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  // Hide player on contact page and podcast PDP pages
  const isContactPage = pathname?.startsWith("/contact");
  const isPodcastPDP = /^\/podcasts\/[^/]+$/.test(pathname || "");

  // Ghost-audio fix (T09): when the UI is hidden on /contact there is no other
  // pause control, so stop playback instead of letting audio run invisibly.
  useEffect(() => {
    if (isContactPage && player.playing) player.toggle();
  }, [isContactPage, player]);

  if (!player.visible || !player.track) return null;
  if (isContactPage || isPodcastPDP) return null;
  const progress = player.duration > 0 ? Math.min(100, (player.currentTime / player.duration) * 100) : 0;

  function seek(clientX: number, element: HTMLElement) {
    if (!player.duration) return;
    const rect = element.getBoundingClientRect();
    const ratio = (rect.right - clientX) / rect.width;
    player.seek(Math.max(0, Math.min(1, ratio)) * player.duration);
  }

  const playButton = (large = false) => (
    <button
      type="button"
      onClick={player.toggle}
      aria-label={player.playing ? "توقف پخش" : "ادامه پخش"}
      className={`${large ? "w-14 h-14" : "w-11 h-11"} rounded-full bg-brand text-brand-on hover:bg-brand-hover flex items-center justify-center transition-colors shrink-0`}
    >
      {player.loading ? <span className="w-4 h-4 border-2 border-brand-on border-t-transparent rounded-full animate-spin" /> : player.playing ? <PauseIcon size={large ? 21 : 17} /> : <PlayIcon size={large ? 21 : 17} />}
    </button>
  );

  return (
    <div className="fixed bottom-[max(12px,env(safe-area-inset-bottom))] inset-x-0 z-[90] px-3 pointer-events-none" dir="rtl">
      <div className="mx-auto max-w-2xl pointer-events-auto drop-shadow-2xl">
        {expanded ? (
          <section className="overflow-hidden rounded-xl border border-border bg-surface/95 backdrop-blur-xl" aria-label="پخش‌کننده صوتی">
            <div
              role="slider"
              aria-label="پیشرفت پخش"
              aria-valuemin={0}
              aria-valuemax={Math.round(player.duration || 0)}
              aria-valuenow={Math.round(player.currentTime)}
              tabIndex={0}
              onClick={(event) => seek(event.clientX, event.currentTarget)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") { event.preventDefault(); player.seek(player.currentTime + 5); }
                if (event.key === "ArrowLeft") { event.preventDefault(); player.seek(player.currentTime - 5); }
              }}
              className="relative h-3 cursor-pointer bg-black/30"
            >
              <span className="absolute inset-y-0 right-0 bg-brand" style={{ width: `${progress}%` }} />
            </div>

            <div className="p-4 md:p-5">
              <div className="flex items-start gap-4">
                <img src={player.track.cover_url || "/design/podcast-cover.webp"} alt="" className="w-16 h-16 md:w-20 md:h-20 rounded-md object-cover shrink-0" />
                <div className="min-w-0 flex-1 text-right pt-1">
                  <div className="text-d-h5 text-white line-clamp-1">{player.track.title}</div>
                  {player.track.subtitle && <div className="mt-1 text-d-body-sm text-text-secondary line-clamp-1">{player.track.subtitle}</div>}
                  <div className="mt-2 text-[12px] text-text-tertiary" dir="ltr">{formatDuration(player.currentTime)} / {formatDuration(player.duration)}</div>
                </div>
                <button type="button" onClick={player.close} aria-label="بستن پخش‌کننده" className="w-11 h-11 flex items-center justify-center text-text-secondary hover:text-white"><CloseIcon size={19} /></button>
              </div>

              <div className="mt-4 flex items-center justify-center gap-4">
                <button type="button" onClick={() => player.seek(player.currentTime - 10)} aria-label="۱۰ ثانیه عقب" className="w-11 h-11 rounded-full flex items-center justify-center text-text-secondary hover:text-brand"><SkipBackIcon size={20} /></button>
                {playButton(true)}
                <button type="button" onClick={() => player.seek(player.currentTime + 10)} aria-label="۱۰ ثانیه جلو" className="w-11 h-11 rounded-full flex items-center justify-center text-text-secondary hover:text-brand"><SkipForwardIcon size={20} /></button>
              </div>
              {player.error && <p className="mt-3 text-center text-d-body-sm text-red-400" role="status">{player.error}</p>}
              <button type="button" onClick={() => setExpanded(false)} className="mx-auto mt-3 w-11 h-6 flex items-center justify-center text-text-tertiary" aria-label="کوچک کردن پخش‌کننده"><span className="w-6 h-0.5 rounded bg-current" /></button>
            </div>
          </section>
        ) : (
          <section className="relative overflow-hidden rounded-full border border-border bg-surface/95 backdrop-blur-xl px-2 py-2 flex items-center gap-2" aria-label="پخش‌کننده صوتی">
            <span className="absolute bottom-0 right-0 h-[2px] bg-brand" style={{ width: `${progress}%` }} />
            <button type="button" onClick={player.close} aria-label="بستن پخش‌کننده" className="w-11 h-11 flex items-center justify-center text-text-secondary hover:text-white shrink-0"><CloseIcon size={18} /></button>
            <button type="button" onClick={() => setExpanded(true)} aria-label="باز کردن پخش‌کننده" className="min-w-0 flex-1 flex items-center gap-3 text-right">
              <img src={player.track.cover_url || "/design/podcast-cover.webp"} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-d-body-sm text-white truncate">{player.track.title}</span>
                <span className="block text-[11px] text-text-tertiary" dir="ltr">{formatDuration(player.currentTime)} / {formatDuration(player.duration)}</span>
              </span>
            </button>
            {playButton()}
          </section>
        )}
      </div>
    </div>
  );
}
