"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { apiGet } from "@/lib/api-client";
import type { Article, Podcast } from "@/lib/types";
import { SearchIcon, CloseIcon } from "@/components/ui/Icons";

type Results = { podcasts: Podcast[]; articles: Article[]; query: string };
type Suggestions = { podcasts: Podcast[]; articles: Article[] };

type HistoryItem = {
  kind: "podcast" | "article";
  slug: string;
  title: string;
  visitedAt: number;
};

const HISTORY_KEY = "ss_search_history_v1";
const HISTORY_MAX = 8;

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

function saveHistory(items: HistoryItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, HISTORY_MAX)));
  } catch {
    // localStorage may be unavailable (private mode, quota); silently degrade
  }
}

/**
 * Global helper used elsewhere in the app (podcast/article pages) to
 * record a visit. Centralising the storage shape here keeps the UI
 * components decoupled.
 */
export function recordSearchHistory(item: Omit<HistoryItem, "visitedAt">) {
  const current = loadHistory();
  const filtered = current.filter(
    (existing) => !(existing.kind === item.kind && existing.slug === item.slug)
  );
  const next: HistoryItem[] = [{ ...item, visitedAt: Date.now() }, ...filtered].slice(0, HISTORY_MAX);
  saveHistory(next);
}

export default function SearchPopover({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  // Focus + history/suggestion fetch on open
  useEffect(() => {
    if (open) {
      openerRef.current = document.activeElement as HTMLElement | null;
      setTimeout(() => inputRef.current?.focus(), 50);
      setHistory(loadHistory());
      // Fetch suggestions lazily so the open animation feels instant
      apiGet<Suggestions>("/api/search/suggestions")
        .then(setSuggestions)
        .catch(() => setSuggestions({ podcasts: [], articles: [] }));
    } else {
      // Reset transient UI state when closing so the next open starts fresh
      setQ("");
      setResults(null);
      setError(null);
      setLoading(false);
      openerRef.current?.focus?.();
      openerRef.current = null;
    }
  }, [open]);

  // Click-outside + escape close
  useEffect(() => {
    if (!open) return;
    const onMouse = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      // Close if the click is outside both the popover and the trigger button(s).
      // The Header's search buttons carry `data-search-trigger`.
      const trigger = (target as HTMLElement).closest?.("[data-search-trigger]");
      const insidePopover = popoverRef.current?.contains(target);
      if (!insidePopover && !trigger) onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Debounced search whenever the query changes
  useEffect(() => {
    if (!open) return;
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const data = await apiGet<Results>(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        setResults(data);
        setError(null);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "خطا در جستجو");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [q, open]);

  // Pick a single recommended item based on a stable hash of "today" so
  // recommendations rotate daily without needing user data.
  const recommendedPodcast = useMemo(() => {
    if (!suggestions || suggestions.podcasts.length === 0) return null;
    const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return suggestions.podcasts[day % suggestions.podcasts.length];
  }, [suggestions]);

  if (!open) return null;

  const trimmed = q.trim();
  const isSearching = trimmed.length >= 2;
  const hasResults =
    !!results && (results.podcasts.length > 0 || results.articles.length > 0);

  const clearHistory = () => {
    saveHistory([]);
    setHistory([]);
  };

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="جستجو"
      dir="rtl"
      className="absolute top-full right-0 mt-2 w-[360px] max-w-[calc(100vw-24px)] z-[110] rounded-xl border border-border bg-bg/95 backdrop-blur-xl shadow-2xl overflow-hidden text-right"
    >
      {/* Search input row */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-border">
        <SearchIcon size={18} className="text-text-secondary shrink-0" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="جست و جو ..."
          className="flex-1 bg-transparent outline-none text-[14px] text-text-primary placeholder:text-text-secondary text-right"
          aria-label="عبارت جستجو"
        />
        {trimmed ? (
          <button
            type="button"
            onClick={() => {
              setQ("");
              inputRef.current?.focus();
            }}
            aria-label="پاک کردن"
            className="w-7 h-7 flex items-center justify-center text-text-secondary hover:text-text-primary"
          >
            <CloseIcon size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="w-7 h-7 flex items-center justify-center text-text-secondary hover:text-text-primary"
          >
            <CloseIcon size={16} />
          </button>
        )}
      </div>

      {/* Body — either search results, or empty state with recs + history */}
      <div className="max-h-[60vh] overflow-y-auto px-2 py-2">
        {isSearching ? (
          <div className="text-[14px]">
            {loading && <p className="text-text-tertiary px-3 py-2">در حال جستجو…</p>}
            {error && <p className="text-red-400 px-3 py-2">{error}</p>}
            {!loading && !error && !hasResults && (
              <p className="text-text-tertiary px-3 py-2">نتیجه‌ای پیدا نشد.</p>
            )}
            {hasResults && (
              <div className="space-y-3">
                {results!.podcasts.length > 0 && (
                  <section>
                    <h3 className="px-3 py-1 text-[12px] text-text-secondary">پادکست‌ها</h3>
                    <ul>
                      {results!.podcasts.slice(0, 4).map((p) => (
                        <li key={p.id}>
                          <Link
                            href={`/podcasts/${p.slug}`}
                            onClick={onClose}
                            className="block px-3 py-2 rounded-md hover:bg-surface text-text-primary text-[14px] line-clamp-1"
                          >
                            {p.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {results!.articles.length > 0 && (
                  <section>
                    <h3 className="px-3 py-1 text-[12px] text-text-secondary">روایت‌ها</h3>
                    <ul>
                      {results!.articles.slice(0, 4).map((a) => (
                        <li key={a.id}>
                          <Link
                            href={`/articles/${a.slug}`}
                            onClick={onClose}
                            className="block px-3 py-2 rounded-md hover:bg-surface text-text-primary text-[14px] line-clamp-1"
                          >
                            {a.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Recommendations */}
            {recommendedPodcast && (
              <section className="px-3 py-2">
                <h3 className="text-[12px] text-text-secondary mb-1">قدرتم بهتره!</h3>
                <Link
                  href={`/podcasts/${recommendedPodcast.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 py-2 rounded-md hover:bg-surface"
                >
                  <img
                    src={recommendedPodcast.cover_url || "/design/podcast-cover.webp"}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] text-text-primary truncate">
                      {recommendedPodcast.title}
                    </span>
                  </span>
                </Link>
              </section>
            )}

            {/* History */}
            {history.length > 0 && (
              <section className="px-3 py-2">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[12px] text-text-secondary">سابقه جستجو</h3>
                  <button
                    type="button"
                    onClick={clearHistory}
                    className="text-[11px] text-text-tertiary hover:text-text-secondary"
                  >
                    پاک کردن
                  </button>
                </div>
                <ul>
                  {history.slice(0, 6).map((item) => (
                    <li key={`${item.kind}-${item.slug}`}>
                      <Link
                        href={
                          item.kind === "podcast"
                            ? `/podcasts/${item.slug}`
                            : `/articles/${item.slug}`
                        }
                        onClick={onClose}
                        className="flex items-center gap-3 py-1.5 rounded-md hover:bg-surface"
                      >
                        <SearchIcon size={14} className="text-text-tertiary shrink-0" />
                        <span className="text-[13px] text-text-secondary truncate">
                          {item.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Quick-filter pills (matches the search shortcut UX) */}
            <section className="px-3 py-2 border-t border-border">
              <div className="flex flex-wrap gap-2 pt-2">
                <Link
                  href="/podcasts?sort=popular"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-full bg-surface border border-border text-[12px] text-text-secondary hover:border-brand hover:text-text-primary transition-colors"
                >
                  پادکست‌های پرطرفدار
                </Link>
                <Link
                  href="/articles?sort=popular"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-full bg-surface border border-border text-[12px] text-text-secondary hover:border-brand hover:text-text-primary transition-colors"
                >
                  روایت‌های پرطرفدار
                </Link>
              </div>
            </section>

            {!suggestions && !history.length && (
              <p className="text-text-tertiary px-3 py-4 text-center text-[13px]">
                برای جستجو شروع به تایپ کنید…
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}