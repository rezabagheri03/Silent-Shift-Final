"use client";

import { useEffect, useRef, useState } from "react";
import type { SortMode, Tag } from "@/lib/types";
import { ChevronDownIcon } from "./Icons";

type Props = {
  tags: Tag[];
  tag?: string;
  sort: SortMode;
  onChange: (next: { tag?: string; sort?: SortMode }) => void;
};

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "new", label: "جدید" },
  { value: "popular", label: "محبوب" },
];

/**
 * Filter chips (by tag) + sort dropdown for PLP pages.
 * Chips: rounded rectangle (not capsule) · active = gold · sort menu dark.
 */
export function SortFilter({ tags, tag, sort, onChange }: Props) {
  const chipBase =
    "inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-md px-4 text-d-body-md font-medium transition-colors";

  const chipIdle =
    "border-[0.5px] border-border-medium bg-transparent text-[#F5F5F5] hover:border-text-secondary hover:text-text-secondary";

  const chipActive = "bg-[#C9A84C] text-black";

  return (
    <div
      dir="rtl"
      className="flex w-full flex-wrap items-center justify-between gap-3 text-d-body-md"
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

      {/* Sort — left; Figma State=Default/Open component */}
      <SortDropdown sort={sort} onChange={onChange} />
    </div>
  );
}

function SortDropdown({
  sort,
  onChange,
}: {
  sort: SortMode;
  onChange: (next: { sort?: SortMode }) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouse = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = SORT_OPTIONS.find((o) => o.value === sort);

  // Figma: one bordered container (radius 6→8 in this scale); the trigger row
  // and open options all live inside it with 22px vertical gaps.
  return (
    <div
      ref={rootRef}
      className="relative inline-flex shrink-0 flex-col rounded-md border-[0.5px] border-border-medium bg-bg px-4 py-2 transition-colors hover:border-text-secondary"
    >
      <span className="sr-only">مرتب‌سازی</span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex cursor-pointer flex-row-reverse items-center gap-[22px] text-d-body-md font-medium text-white focus:outline-none"
      >
        <ChevronDownIcon
          size={24}
          className={`pointer-events-none text-text-secondary transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
        {current?.label ?? "جدید"}
      </button>

      {open && (
        <ul role="listbox" className="mt-[22px] flex flex-col gap-[22px] pb-1">
          {/* Figma open state: only unselected options are listed */}
          {SORT_OPTIONS.filter((opt) => opt.value !== sort).map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => {
                  onChange({ sort: opt.value });
                  setOpen(false);
                }}
                className="w-full whitespace-nowrap text-right text-d-body-md font-medium text-text-secondary transition-colors hover:text-white focus:outline-none"
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
