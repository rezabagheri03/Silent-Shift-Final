"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { usePlayer } from "./PlayerContext";
import { formatDuration } from "@/lib/utils";
import { PlayIcon, PauseIcon, CloseIcon, ChevronDownIcon } from "@/components/ui/Icons";
import { Rewind10Icon } from "./Rewind10Icon";
import { Forward30Icon } from "./Forward30Icon";

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
    // bar fills left→right, so ratio is measured from the left edge
    const ratio = (clientX - rect.left) / rect.width;
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
          /* Expanded state — Figma 1:6505 "Player Expand": 477 wide, bg #171717,
             radius 8 top corners, p-6, vertical gap 32 */
          <section
            className="max-w-full overflow-hidden rounded-t-md bg-[#171717]"
            style={{ width: 477 }}
            aria-label="پخش‌کننده صوتی"
          >
            <div className="flex flex-col items-center gap-8 p-6">
              {/* Title Section — collapse chevron RIGHT, more LEFT, label centered */}
              <div className="flex h-10 w-full items-center justify-between">
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  aria-label="کوچک کردن پخش‌کننده"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F5F5F5]/15 transition-colors hover:bg-[#F5F5F5]/25"
                >
                  <ChevronDownIcon size={24} className="text-[#A1A1AA]" />
                </button>
                <span className="text-[20px] font-medium leading-7 text-[#C9A84C]">در حال پخش</span>
                <button
                  type="button"
                  aria-label="گزینه‌های بیشتر"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F5F5F5]/15 transition-colors hover:bg-[#F5F5F5]/25"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-[#A1A1AA]">
                    <circle cx="12" cy="5" r="2" fill="currentColor" />
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                    <circle cx="12" cy="19" r="2" fill="currentColor" />
                  </svg>
                </button>
              </div>

              {/* Picture — 302×302, radius 24, gold hairline + soft glow, image inset 10px */}
              <div
                className="h-[302px] w-[302px] max-w-full overflow-hidden rounded-3xl border-[0.5px] border-[#C9A84C] p-[10px]"
                style={{ boxShadow: "0 0 24px 2px rgba(212,175,55,0.15)" }}
              >
                <img
                  src={player.track.cover_url || "/design/podcast-cover.webp"}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Heading — episode title + author · dot · category */}
              <div className="flex w-full flex-col items-center gap-4">
                <h3 className="line-clamp-1 w-full text-center text-[24px] font-semibold leading-8 text-[#C9A84C]">
                  {player.track.title}
                </h3>
                <div className="flex items-center gap-6 text-[16px] leading-7 text-[#A1A1AA]">
                  <span>برزو ذاکری</span>
                  <span aria-hidden className="h-2 w-2 rounded-full bg-[#C9A84C]" />
                  {player.track.subtitle && <span className="truncate">{player.track.subtitle}</span>}
                </div>
              </div>

              {/* Progressing — px-12, 4px gold bar over subtle track, times below */}
              <div className="w-full px-12">
                <div
                  role="slider"
                  aria-label="پیشرفت پخش"
                  aria-valuemin={0}
                  aria-valuemax={Math.round(player.duration || 0)}
                  aria-valuenow={Math.round(player.currentTime)}
                  aria-valuetext={`${formatDuration(player.currentTime)} از ${formatDuration(player.duration || 0)}`}
                  tabIndex={0}
                  onClick={(event) => seek(event.clientX, event.currentTarget)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowRight") { event.preventDefault(); player.seek(player.currentTime + 5); }
                    if (event.key === "ArrowLeft") { event.preventDefault(); player.seek(player.currentTime - 5); }
                  }}
                  className="relative h-4 cursor-pointer"
                  dir="ltr"
                >
                  <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-white/10" />
                  <span className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-[#C9A84C]" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-[14px] leading-5 text-white">
                  <span dir="ltr">-{formatDuration(Math.max(0, player.duration - player.currentTime))}</span>
                  <span>{formatDuration(player.currentTime)}</span>
                </div>
              </div>

              {/* Player Controller — rewind 10 · play/pause 48px gold · forward 30, gap 32 */}
              <div dir="ltr" className="flex items-center gap-8">
                <button
                  type="button"
                  onClick={() => player.seek(player.currentTime - 10)}
                  aria-label="۱۰ ثانیه عقب"
                  className="shrink-0 text-[#A1A1AA] transition-colors hover:text-white"
                >
                  <Rewind10Icon />
                </button>
                <button
                  type="button"
                  onClick={player.toggle}
                  aria-label={player.playing ? "توقف پخش" : "ادامه پخش"}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#C9A84C] text-black transition-opacity hover:opacity-90"
                >
                  {player.loading ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  ) : player.playing ? (
                    <PauseIcon size={24} />
                  ) : (
                    <PlayIcon size={24} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => player.seek(player.currentTime + 30)}
                  aria-label="۳۰ ثانیه جلو"
                  className="shrink-0 text-[#A1A1AA] transition-colors hover:text-white"
                >
                  <Forward30Icon />
                </button>
              </div>

              {player.error && <p className="text-center text-d-body-sm text-red-400" role="status">{player.error}</p>}
            </div>
          </section>
        ) : (
          /* Normal state — Figma 1:6490 "Default": flat 500x147 block, bg #171717 */
          <section
            className="relative overflow-hidden w-[500px] max-w-full bg-[#171717]"
            aria-label="پخش‌کننده صوتی"
          >
            {/* Nav Action row — Figma: chevron RIGHT, close LEFT (RTL: first child = right) */}
            <div className="flex h-8 items-center justify-between px-2 py-1">
              <button type="button" onClick={() => setExpanded(true)} aria-label="باز کردن پخش‌کننده" className="flex h-6 w-6 items-center justify-center text-[#A1A1AA] hover:text-white transition-colors">
                <ChevronDownIcon size={24} className="rotate-180" />
              </button>
              <button type="button" onClick={player.close} aria-label="بستن پخش‌کننده" className="flex h-6 w-6 items-center justify-center text-[#52525B] hover:text-white transition-colors">
                <CloseIcon size={14} />
              </button>
            </div>

            {/* Divider — gradient hairline (same recipe as footer dividers) */}
            <div aria-hidden className="h-px w-full" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.80) 52%, rgba(255,255,255,0.10) 100%)" }} />

            {/* Body — Figma visual L→R: play, rewind, titles, cover (RTL: reverse DOM = cover first) */}
            <div dir="ltr" className="flex items-center gap-4 pb-1 pl-1 pr-2 pt-1">
              <button
                type="button"
                onClick={player.toggle}
                aria-label={player.playing ? "توقف پخش" : "ادامه پخش"}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#C9A84C] text-black transition-opacity hover:opacity-90"
              >
                {player.loading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                ) : player.playing ? (
                  <PauseIcon size={24} />
                ) : (
                  <PlayIcon size={24} />
                )}
              </button>

              <button
                type="button"
                onClick={() => player.seek(player.currentTime - 10)}
                aria-label="۱۰ ثانیه عقب"
                className="shrink-0 text-[#F5F5F5] transition-colors hover:text-white"
              >
                <Rewind10Icon />
              </button>

              <button type="button" onClick={() => setExpanded(true)} dir="rtl" className="min-w-0 flex-1 text-right" aria-label="باز کردن پخش‌کننده">
                <span className="block text-right text-[20px] leading-8 text-[#C9A84C]">در حال پخش</span>
                <span className="mt-[9px] block truncate text-right text-[20px] leading-8 text-white">{player.track.title}</span>
              </button>

              <div className="shrink-0 p-1">
                <img
                  src={player.track.cover_url || "/design/podcast-cover.webp"}
                  alt=""
                  className="h-[92px] w-[92px] rounded object-cover"
                />
              </div>
            </div>

            {/* Progress — 4px bar flush with the bottom edge */}
            <div
              role="slider"
              aria-label="پیشرفت پخش"
              aria-valuemin={0}
              aria-valuemax={Math.round(player.duration || 0)}
              aria-valuenow={Math.round(player.currentTime)}
              aria-valuetext={`${formatDuration(player.currentTime)} از ${formatDuration(player.duration || 0)}`}
              tabIndex={0}
              onClick={(event) => seek(event.clientX, event.currentTarget)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") { event.preventDefault(); player.seek(player.currentTime + 5); }
                if (event.key === "ArrowLeft") { event.preventDefault(); player.seek(player.currentTime - 5); }
              }}
              className="relative h-1 w-full cursor-pointer"
            >
              <span className="absolute inset-y-0 left-0 bg-[#C9A84C]" style={{ width: `${progress}%` }} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
