import { estimateReadingTime } from "@/lib/reading-time";

type Props = {
  minutes?: number | null;
  body?: string;
  className?: string;
};

/**
 * Displays "X دقیقه مطالعه". Uses the explicit `minutes` if provided,
 * otherwise auto-estimates from the article body.
 */
export function ReadingTime({ minutes, body, className = "" }: Props) {
  const mins = minutes && minutes > 0 ? minutes : estimateReadingTime(body ?? "");
  return (
    <span className={`inline-flex items-center gap-1.5 text-d-body-sm text-text-tertiary ${className}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span dir="ltr">{mins}</span>
      <span>دقیقه مطالعه</span>
    </span>
  );
}
