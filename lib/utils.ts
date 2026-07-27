/** Convert a Persian/Arabic-digit string to ASCII digits */
export function toAsciiDigits(s: string): string {
  return s
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

/** 2400 -> "40:00", 3725 -> "1:02:05" */
export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const s = Math.floor(totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

/** Render a Persian-localized date (e.g. "۱۴۰۴/۰۳/۲۶") */
export function formatPersianDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return ""; // Invalid date — return empty rather than "NaN/NaN/NaN"
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  } catch {
    return "";
  }
}

/** Make a URL-safe slug from a Persian or English title */
export function slugify(input: string): string {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    // keep Persian letters, ASCII letters/digits, and hyphen
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  if (base) return base;

  // Deterministic fallback: hash the original input so the same title always
  // produces the same slug (unlike Date.now which changes per call).
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
  }
  return `item-${(hash >>> 0).toString(36)}`;
}

/** Truncate a string to N characters, adding an ellipsis */
export function truncate(s: string | null | undefined, n = 120): string {
  if (!s) return "";
  return s.length > n ? s.slice(0, n).trim() + "…" : s;
}
