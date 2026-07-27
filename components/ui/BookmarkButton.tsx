"use client";

import { useEffect, useState } from "react";
import { BookmarkIcon } from "./Icons";

const STORAGE_KEY = "silent-shift:saved-articles";

function readSaved(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function BookmarkButton({ slug, title }: { slug: string; title: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(readSaved().includes(slug));
    sync();
    window.addEventListener("ss-bookmarks", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ss-bookmarks", sync);
      window.removeEventListener("storage", sync);
    };
  }, [slug]);

  function toggle() {
    const current = readSaved();
    const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSaved(next.includes(slug));
    window.dispatchEvent(new Event("ss-bookmarks"));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={saved ? `حذف ${title} از ذخیره‌شده‌ها` : `ذخیره ${title}`}
      aria-pressed={saved}
      className="relative z-20 w-10 h-10 rounded-full bg-overlay-chip flex items-center justify-center text-white hover:text-brand transition-colors"
    >
      <BookmarkIcon size={20} filled={saved} />
    </button>
  );
}
