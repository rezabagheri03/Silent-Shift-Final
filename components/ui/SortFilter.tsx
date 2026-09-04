"use client";

import { useEffect, useRef, useState } from "react";
import type { SortMode, Tag } from "@/lib/types";
import { ChevronDownIcon, CloseIcon, FilterIcon } from "./Icons";

type Props = {
  tags: Tag[];
  tag?: string;
  selectedTags?: string[];
  sort: SortMode;
  onChange: (next: { tag?: string; tags?: string[]; sort?: SortMode }) => void;
};

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "new", label: "جدید" },
  { value: "popular", label: "محبوب" },
];

/**
 * Filter chips (by tag) + sort dropdown for PLP pages.
 * Chips: rounded rectangle (not capsule) · active = gold · sort menu dark.
 *
 * Mobile (Figma 1:6939 "Filter Mobile", row 1:1644, pills 1:1647): a single
 * row with a Filter button (right) and a Sort button (left); tapping Filter
 * opens the options as an overlay panel (content below never shifts),
 * multi-select stays open per tap, and each chosen tag renders as a
 * dismissible pill in a row below (Figma 1:1647).
 * Desktop keeps the exposed chip cloud.
 */
export function SortFilter({ tags, tag, selectedTags, sort, onChange }: Props) {
  const selected: string[] = selectedTags ?? (tag ? [tag] : []);
  const [filterOpen, setFilterOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterOpen) return;
    const onMouse = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setFilterOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFilterOpen(false);
    };
    const t = setTimeout(() => {
      document.addEventListener("mousedown", onMouse);
      document.addEventListener("keydown", onKey);
    }, 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown", onKey);
    };
  }, [filterOpen]);

  const toggleTag = (slug: string) => {
    const next = selected.includes(slug) ? selected.filter((t) => t !== slug) : [...selected, slug];
    onChange({ tags: next });
  };

  const activeTags = tags.filter((t) => selected.includes(t.slug));
  const showAllActive = selected.length === 0;

  const chipBase =
    "inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-md px-4 text-d-body-md font-medium transition-colors";

  const chipIdle =
    "border-[0.5px] border-border-medium bg-transparent text-[#F5F5F5] hover:border-text-secondary hover:text-text-secondary";

  const chipActive = "bg-[#C9A84C] text-black";

  return (
    <div dir="rtl" className="flex w-full flex-col gap-3 text-d-body-md">
      <div className="flex w-full items-center justify-between md:hidden">
        <div ref={dropdownRef} className="relative inline-flex shrink-0 flex-col">
          <div
            aria-hidden={filterOpen}
            className={`inline-flex flex-col rounded-[6px] border-[0.5px] border-border-medium bg-bg px-4 py-2 transition-colors hover:border-text-secondary ${filterOpen ? "invisible" : ""}`}
          >
            <button
              type="button"
              onClick={() => setFilterOpen((o) => !o)}
              aria-expanded={filterOpen}
              aria-haspopup="listbox"
              tabIndex={filterOpen ? -1 : undefined}
              className="flex cursor-pointer items-center gap-[14px] whitespace-nowrap text-base font-medium leading-6 text-[#FFEFC4] focus:outline-none"
            >
              فیلتر
              <FilterIcon size={20} />
            </button>
          </div>

          <div
            role="listbox"
            aria-label="فیلتر بر اساس موضوع"
            aria-multiselectable
            aria-hidden={!filterOpen}
            inert={!filterOpen}
            data-open={filterOpen}
            className="absolute right-0 top-0 z-30 grid w-max min-w-full transition-[grid-template-rows,opacity] duration-200 ease-out data-[open=true]:grid-rows-[1fr] data-[open=true]:opacity-100 data-[open=false]:pointer-events-none data-[open=false]:grid-rows-[0fr] data-[open=false]:opacity-0"
          >
            <div className="min-h-0 overflow-hidden">
              <div className="rounded-[6px] border-[0.5px] border-border-medium bg-bg px-4 py-2">
                <button
                  type="button"
                  onClick={() => setFilterOpen((o) => !o)}
                  aria-expanded={filterOpen}
                  aria-haspopup="listbox"
                  tabIndex={filterOpen ? undefined : -1}
                  className="flex cursor-pointer items-center gap-[14px] whitespace-nowrap text-base font-medium leading-6 text-[#FFEFC4] focus:outline-none"
                >
                  فیلتر
                  <FilterIcon size={20} />
                </button>
                <div className="flex flex-col gap-[14px] pt-[14px]">
                  <button
                    type="button"
                    role="option"
                    aria-selected={showAllActive}
                    onClick={() => { onChange({ tags: [] }); setFilterOpen(false); }}
                    className={`whitespace-nowrap text-right text-base font-medium leading-6 transition-colors ${showAllActive ? "text-[#FFEFC4]" : "text-white"}`}
                  >
                    همه
                  </button>
                  {tags.map((t) => {
                    const isOn = selected.includes(t.slug);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        role="option"
                        aria-selected={isOn}
                        onClick={() => toggleTag(t.slug)}
                        className={`whitespace-nowrap text-right text-base font-medium leading-6 transition-colors ${isOn ? "text-[#FFEFC4]" : "text-[#F5F5F5] hover:text-white"}`}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <SortDropdown sort={sort} onChange={onChange} />
      </div>

      {activeTags.length > 0 && (
        <div className="flex w-full flex-wrap items-center justify-start gap-2 md:hidden">
          {activeTags.map((t) => (
            <span key={t.slug} className="inline-flex h-8 items-center gap-4 rounded bg-[#52525B] p-1">
              <span className="text-base font-medium leading-6 text-[#FFEFC4]">{t.name}</span>
              <button
                type="button"
                onClick={() => toggleTag(t.slug)}
                aria-label={`حذف فیلتر ${t.name}`}
                className="flex h-[18px] w-[18px] items-center justify-center text-[#A1A1AA] transition-colors hover:text-white"
              >
                <CloseIcon size={18} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="hidden w-full flex-wrap items-center justify-between gap-3 md:flex">
        <div className="flex flex-wrap items-center justify-start gap-2">
          <button type="button" onClick={() => onChange({ tags: [] })} className={chipBase + " " + (selected.length === 0 ? chipActive : chipIdle)}>
            همه
          </button>
          {tags.map((t) => (
            <button key={t.id} type="button" onClick={() => toggleTag(t.slug)} className={chipBase + " " + (selected.includes(t.slug) ? chipActive : chipIdle)}>
              {t.name}
            </button>
          ))}
        </div>
        <SortDropdown sort={sort} onChange={onChange} />
      </div>
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
