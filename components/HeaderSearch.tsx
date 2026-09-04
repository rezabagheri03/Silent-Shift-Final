"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { apiGet } from "@/lib/api-client";
import { SearchIcon, ClockIcon } from "@/components/ui/Icons";

type HistoryItem = {
  kind: "podcast" | "article";
  slug: string;
  title: string;
  visitedAt: number;
};

const HISTORY_KEY = "ss_search_history_v1";

function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is HistoryItem =>
        !!item &&
        typeof item === "object" &&
        (item.kind === "podcast" || item.kind === "article") &&
        typeof item.slug === "string" &&
        typeof item.title === "string" &&
        typeof item.visitedAt === "number"
    );
  } catch {
    return [];
  }
}

function removeHistoryItem(visitedAt: number) {
  if (typeof window === "undefined") return;
  const next = loadHistory().filter((item) => item.visitedAt !== visitedAt);
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // localStorage may be unavailable; silently degrade
  }
  return next;
}

type Suggestion = { kind: "podcast" | "article"; slug: string; title: string };

export default function HeaderSearch({ autoFocus = false, onNavigate }: { autoFocus?: boolean; onNavigate?: () => void } = {}) {
  const [focused, setFocused] = useState(autoFocus);
  const [q, setQ] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [results, setResults] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    setHistory(loadHistory());
    let cancelled = false;
    apiGet<{ podcasts: { slug: string; title: string }[]; articles: { slug: string; title: string }[] }>(
      "/api/search/suggestions"
    )
      .then((data) => {
        if (cancelled) return;
        setSuggestions([
          ...data.podcasts.slice(0, 2).map((p) => ({ kind: "podcast" as const, slug: p.slug, title: p.title })),
          ...data.articles.slice(0, 2).map((a) => ({ kind: "article" as const, slug: a.slug, title: a.title })),
        ]);
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced live search while typing
  useEffect(() => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const data = await apiGet<{
          podcasts: { slug: string; title: string }[];
          articles: { slug: string; title: string }[];
        }>(`/api/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal });
        setResults([
          ...data.podcasts.slice(0, 3).map((p) => ({ kind: "podcast" as const, slug: p.slug, title: p.title })),
          ...data.articles.slice(0, 3).map((a) => ({ kind: "article" as const, slug: a.slug, title: a.title })),
        ]);
      } catch {
        if (!controller.signal.aborted) setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [q]);

  // Click-outside + Escape close (mobile: also close the header search)
  useEffect(() => {
    if (!focused) return;
    const dismiss = () => {
      setFocused(false);
      onNavigate?.();
    };
    const onMouse = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (target && !rootRef.current?.contains(target)) dismiss();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismiss();
        inputRef.current?.blur();
      }
    };
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown", onKey);
    };
  }, [focused]);

  const dropdownOpen = focused && (q.trim().length >= 2 || history.length > 0 || suggestions.length > 0);
  const trimmed = q.trim();

  return (
    <div ref={rootRef} className="relative w-[280px] shrink-0" dir="rtl">
      {/* Input — Figma: 280×44, bg #171717, border #262626, radius 8; RTL: icon on the right */}
      <div className="group flex h-11 w-full items-center gap-2 rounded-md border border-border bg-surface px-3.5 shadow-xs">
        <SearchIcon size={20} className="order-1 shrink-0 text-white group-focus-within:text-text-secondary" />
        {focused && <span aria-hidden className="order-2 h-[18px] w-px shrink-0 bg-text-secondary" />}
        <input
          ref={inputRef}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="جست و جو ..."
          aria-label="جستجو"
          className="order-3 h-full w-full min-w-0 bg-transparent text-right text-[16px] font-medium leading-6 text-white outline-none focus-visible:outline-none placeholder:text-white focus:placeholder:text-text-tertiary"
        />
      </div>

      {/* Dropdown — Figma: bg #171717, radius 8, padding 8, gap 16 */}
      {dropdownOpen && (
        <div className="absolute top-[52px] right-0 w-[280px] rounded-md bg-surface p-2 z-[110] shadow-2xl">
          {/* Live results while typing */}
          {trimmed.length >= 2 ? (
            <div className="flex flex-col gap-4">
              {loading && results.length === 0 && (
                <p className="px-1 py-1 text-[14px] leading-5 text-text-tertiary">در حال جستجو…</p>
              )}
              {!loading && results.length === 0 && (
                <p className="px-1 py-1 text-[14px] leading-5 text-text-tertiary">نتیجه‌ای پیدا نشد.</p>
              )}
              {results.map((item) => (
                <Link
                  key={`${item.kind}-${item.slug}`}
                  href={item.kind === "podcast" ? `/podcasts/${item.slug}` : `/articles/${item.slug}`}
                  onClick={() => { setFocused(false); onNavigate?.(); }}
                  className="flex items-center justify-start gap-[7px] text-right"
                >
                  <SearchIcon size={20} className="shrink-0 text-white" />
                  <span className="truncate text-[14px] leading-5 text-white">{item.title}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* History — clock icon, dimmed title, per-row پاک کردن */}
              {history.length > 0 && (
                <div className="flex flex-col gap-4">
                  {history.slice(0, 2).map((item) => (
                    <div key={item.visitedAt} className="flex items-center justify-start gap-[7px]">
                      <ClockIcon size={18} className="shrink-0 text-text-secondary" />
                      <Link
                        href={item.kind === "podcast" ? `/podcasts/${item.slug}` : `/articles/${item.slug}`}
                        onClick={() => { setFocused(false); onNavigate?.(); }}
                        className="truncate text-[14px] leading-5 text-text-secondary hover:text-white"
                      >
                        {item.title}
                      </Link>
                      <button
                        type="button"
                        onClick={() => setHistory(removeHistoryItem(item.visitedAt) ?? [])}
                        className="shrink-0 text-[12px] leading-4 text-text-tertiary underline hover:text-text-secondary"
                        aria-label={`پاک کردن ${item.title}`}
                      >
                        پاک کردن
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {/* Suggestions — search icon + white title */}
              {suggestions.length > 0 && (
                <div className="flex flex-col gap-4">
                  {suggestions.map((item) => (
                    <Link
                      key={`${item.kind}-${item.slug}`}
                      href={item.kind === "podcast" ? `/podcasts/${item.slug}` : `/articles/${item.slug}`}
                      onClick={() => { setFocused(false); onNavigate?.(); }}
                      className="flex items-center justify-start gap-[7px] text-right"
                    >
                      <SearchIcon size={20} className="shrink-0 text-white" />
                      <span className="truncate text-[14px] leading-5 text-white">{item.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
