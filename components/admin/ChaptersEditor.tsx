"use client";

import { useState } from "react";

export type ChapterInput = { title: string; start_seconds: number };

type Props = {
  value: ChapterInput[];
  onChange: (chapters: ChapterInput[]) => void;
};

/** Parse "MM:SS" or "HH:MM:SS" into seconds; returns NaN if invalid. */
function parseTs(s: string): number {
  const clean = s.trim();
  if (!clean) return NaN;
  const parts = clean.split(":").map((p) => Number(p));
  if (parts.some((n) => !Number.isFinite(n) || n < 0)) return NaN;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 1) return parts[0]; // raw seconds
  return NaN;
}

function formatTs(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function ChaptersEditor({ value, onChange }: Props) {
  // Local string state for the timestamp inputs so users can type freely
  const [drafts, setDrafts] = useState<string[]>(value.map((c) => formatTs(c.start_seconds)));

  const update = (i: number, patch: Partial<ChapterInput>) => {
    const next = value.map((c, idx) => (idx === i ? { ...c, ...patch } : c));
    onChange(next);
  };

  const updateTs = (i: number, raw: string) => {
    const nextDrafts = drafts.slice();
    nextDrafts[i] = raw;
    setDrafts(nextDrafts);
    const parsed = parseTs(raw);
    if (Number.isFinite(parsed)) {
      update(i, { start_seconds: parsed });
    }
  };

  const add = () => {
    const nextSec = value.length > 0 ? value[value.length - 1].start_seconds + 60 : 0;
    onChange([...value, { title: "", start_seconds: nextSec }]);
    setDrafts([...drafts, formatTs(nextSec)]);
  };

  const remove = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i));
    setDrafts(drafts.filter((_, idx) => idx !== i));
  };

  return (
    <div className="block">
      <div className="flex items-center justify-between mb-2">
        <span className="text-d-body-sm text-text-secondary">فصل‌ها / بخش‌ها</span>
        <button
          type="button"
          onClick={add}
          className="text-d-body-sm text-brand hover:text-brand-hover transition-colors"
        >
          + افزودن بخش
        </button>
      </div>

      {value.length === 0 && (
        <p className="text-d-body-sm text-text-tertiary bg-surface border border-border rounded-md p-3">
          هیچ بخشی تعریف نشده. برای افزودن بخش، دکمه‌ی بالا را بزنید.
        </p>
      )}

      <div className="space-y-2">
        {value.map((c, i) => {
          const invalid = drafts[i] !== undefined && !Number.isFinite(parseTs(drafts[i]));
          return (
            <div key={i} className="flex gap-2 items-start">
              <input
                type="text"
                placeholder="۰:۰۰"
                value={drafts[i] ?? formatTs(c.start_seconds)}
                onChange={(e) => updateTs(i, e.target.value)}
                dir="ltr"
                className={`w-24 bg-bg border rounded-md px-2 py-2 text-d-body-sm text-text-primary text-center outline-none focus:border-brand transition-colors ${
                  invalid ? "border-red-500" : "border-border"
                }`}
                aria-label="زمان شروع"
              />
              <input
                type="text"
                placeholder="عنوان بخش"
                value={c.title}
                onChange={(e) => update(i, { title: e.target.value })}
                className="flex-1 bg-bg border border-border rounded-md px-3 py-2 text-d-body-sm text-text-primary outline-none focus:border-brand transition-colors text-right"
                aria-label="عنوان بخش"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-red-400 hover:text-red-300 transition-colors px-2 py-2"
                aria-label="حذف"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-d-body-sm text-text-tertiary mt-2">
        قالب زمان: <code dir="ltr" className="text-brand">MM:SS</code> یا{" "}
        <code dir="ltr" className="text-brand">HH:MM:SS</code>
      </p>
    </div>
  );
}
