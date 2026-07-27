/**
 * Estimate reading time in minutes for Persian text.
 *
 * Persian reading speed is roughly 200 words per minute (comparable to English
 * for adult readers). We count "words" as whitespace-separated tokens after
 * stripping markdown syntax and inline code.
 */
export function estimateReadingTime(text: string | null | undefined): number {
  if (!text) return 1;
  const cleaned = text
    // Strip markdown syntax that shouldn't count toward reading time
    .replace(/`[^`]*`/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_>#\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return 1;
  const wordCount = cleaned.split(/\s+/).length;
  return Math.max(1, Math.round(wordCount / 200));
}
