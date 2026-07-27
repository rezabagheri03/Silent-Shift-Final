"use client";

import type { SortMode, Tag } from "@/lib/types";
import { ChevronDownIcon } from "./Icons";

type Props = {
  tags: Tag[];
  tag?: string;
  sort: SortMode;
  onChange: (next: { tag?: string; sort?: SortMode }) => void;
};

/**
 * Filter chips (by tag) + sort dropdown for PLP pages.
 * Chips: rounded rectangle (not capsule) · active = gold · sort menu dark.
 */
export function SortFilter({ tags, tag, sort, onChange }: Props) {
  const chipBase =
    "inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg px-5 py-2 text-d-body-sm transition-colors";

  const chipIdle =
    "border border-white/20 bg-transparent text-text-primary hover:border-brand hover:text-brand";

  const chipActive = "border border-transparent bg-brand text-black";

  return (
    <div
      dir="rtl"
      className="flex w-full flex-wrap items-center justify-between gap-3 text-d-body-sm"
    >
      {/* Tag chips — right */}
      <div className="flex flex-wrap items-center justify-start gap-2">
        <button
          type="button"
          onClick={() => onChange({ tag: undefined })}
          className={`${chipBase} ${!tag ? chipActive : chipIdle}`}
        >
          همه
        </button>

        {tags.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange({ tag: t.slug })}
            className={`${chipBase} ${
              tag === t.slug ? chipActive : chipIdle
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Sort — left; dark panel so open menu text stays visible */}
      <label className="relative inline-flex shrink-0 items-center">
        <span className="sr-only">مرتب‌سازی</span>
        <select
          value={sort}
          onChange={(e) => onChange({ sort: e.target.value as SortMode })}
          className="min-h-11 cursor-pointer appearance-none rounded-lg border border-white/20 bg-[#171717] py-2 pl-9 pr-4 text-d-body-sm text-white transition-colors hover:border-brand focus:border-brand focus:outline-none"
        >
          <option value="new" className="bg-[#171717] text-white">
            جدید
          </option>
          <option value="popular" className="bg-[#171717] text-white">
            محبوب
          </option>
        </select>
        <ChevronDownIcon
          size={16}
          className="pointer-events-none absolute left-3 text-text-secondary"
        />
      </label>
    </div>
  );
}