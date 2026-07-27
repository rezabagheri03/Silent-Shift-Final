"use client";

type Props = {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
};

/**
 * RTL-aware pagination. Visual layout: [بعدی]  [n/total]  [قبلی]
 * where "بعدی" (next) is on the visual left side per RTL reading order.
 */
export function Pagination({ page, totalPages, onChange }: Props) {
  const canNext = page < totalPages;
  const canPrev = page > 1;
  if (totalPages <= 1) return null;
  return (
    <nav
      aria-label="صفحه‌بندی"
      className="flex items-center justify-between text-d-body-md mt-6"
    >
      <button
        type="button"
        onClick={() => canNext && onChange(page + 1)}
        disabled={!canNext}
        className="text-text-primary hover:text-brand disabled:opacity-30 disabled:hover:text-text-primary transition-colors px-3 py-1"
      >
        بعدی →
      </button>
      <span className="text-text-secondary" dir="ltr">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        onClick={() => canPrev && onChange(page - 1)}
        disabled={!canPrev}
        className="text-text-primary hover:text-brand disabled:opacity-30 disabled:hover:text-text-primary transition-colors px-3 py-1"
      >
        ← قبلی
      </button>
    </nav>
  );
}
