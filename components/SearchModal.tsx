"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { apiGet } from "@/lib/api-client";
import type { Article, Podcast } from "@/lib/types";
import { SearchIcon, CloseIcon } from "@/components/ui/Icons";

type Results = { podcasts: Podcast[]; articles: Article[]; query: string };

export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQ("");
      setResults(null);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,[tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", onKey); };
  }, [open, onClose]);

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
        const data = await apiGet<Results>(`/api/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal });
        setResults(data);
        setError(null);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "خطا در جستجو");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => { clearTimeout(t); controller.abort(); };
  }, [q, open]);

  if (!open) return null;

  const hasResults = !!results && (results.podcasts.length > 0 || results.articles.length > 0);

  return (
    <div ref={dialogRef} className="fixed inset-0 z-[110]" role="dialog" aria-modal="true" aria-label="جستجو">
      <button
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-label="بستن جستجو"
      />
      <div className="absolute inset-x-0 top-0 max-h-[90vh] overflow-y-auto bg-bg border-b border-border shadow-2xl">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="flex items-center gap-3 bg-surface border border-border rounded-md px-4 py-3 focus-within:border-brand transition-colors">
            <SearchIcon size={20} />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="جستجو در پادکست‌ها و روایت‌ها…"
              className="flex-1 bg-transparent outline-none text-d-body-md text-text-primary placeholder:text-text-secondary text-right"
              aria-label="عبارت جستجو"
            />
            <button onClick={onClose} aria-label="بستن" className="w-11 h-11 flex items-center justify-center text-text-secondary hover:text-text-primary">
              <CloseIcon size={20} />
            </button>
          </div>

          <div className="mt-6 text-d-body-md">
            {q.trim().length > 0 && q.trim().length < 2 && (
              <p className="text-text-tertiary">حداقل ۲ حرف وارد کنید…</p>
            )}
            {loading && <p className="text-text-tertiary">در حال جستجو…</p>}
            {error && <p className="text-red-400">{error}</p>}
            {!loading && !error && q.trim().length >= 2 && !hasResults && (
              <p className="text-text-tertiary">نتیجه‌ای پیدا نشد.</p>
            )}

            {hasResults && (
              <div className="space-y-6">
                {results!.podcasts.length > 0 && (
                  <section>
                    <h3 className="text-d-h5 text-text-secondary mb-3">پادکست‌ها</h3>
                    <ul className="space-y-2">
                      {results!.podcasts.map((p) => (
                        <li key={p.id}>
                          <Link
                            href={`/podcasts/${p.slug}`}
                            onClick={onClose}
                            className="block p-3 bg-surface rounded-md hover:bg-surface/70 transition-colors"
                          >
                            <div className="text-text-primary">{p.title}</div>
                            {p.subtitle && <div className="text-text-secondary text-d-body-sm mt-1">{p.subtitle}</div>}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {results!.articles.length > 0 && (
                  <section>
                    <h3 className="text-d-h5 text-text-secondary mb-3">روایت‌ها</h3>
                    <ul className="space-y-2">
                      {results!.articles.map((a) => (
                        <li key={a.id}>
                          <Link
                            href={`/articles/${a.slug}`}
                            onClick={onClose}
                            className="block p-3 bg-surface rounded-md hover:bg-surface/70 transition-colors"
                          >
                            <div className="text-text-primary">{a.title}</div>
                            {a.excerpt && <div className="text-text-secondary text-d-body-sm mt-1">{a.excerpt}</div>}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
