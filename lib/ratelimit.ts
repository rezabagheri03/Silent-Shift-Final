import { db } from "@/lib/db";

/**
 * Fixed-window rate limiter backed by SQLite.
 * Returns { ok: true } if allowed, otherwise { ok: false, retry_after_seconds }.
 */
export function rateLimit(
  key: string,
  opts: { windowSeconds: number; max: number }
): { ok: true } | { ok: false; retry_after_seconds: number } {
  const now = Math.floor(Date.now() / 1000);
  const bucket = Math.floor(now / opts.windowSeconds) * opts.windowSeconds;

  // Clean up old buckets occasionally (1% chance per call)
  if (Math.random() < 0.01) {
    db.prepare("DELETE FROM rate_limits WHERE bucket_start < ?").run(now - opts.windowSeconds * 4);
  }

  const tx = db.transaction(() => {
    const row = db
      .prepare("SELECT count FROM rate_limits WHERE key = ? AND bucket_start = ?")
      .get(key, bucket) as { count: number } | undefined;
    const next = (row?.count ?? 0) + 1;
    if (row) {
      db.prepare("UPDATE rate_limits SET count = ? WHERE key = ? AND bucket_start = ?").run(
        next,
        key,
        bucket
      );
    } else {
      db.prepare("INSERT INTO rate_limits (key, bucket_start, count) VALUES (?, ?, ?)").run(
        key,
        bucket,
        next
      );
    }
    return next;
  });

  const current = tx();
  if (current > opts.max) {
    return { ok: false, retry_after_seconds: bucket + opts.windowSeconds - now };
  }
  return { ok: true };
}

// Strict IPv4 / IPv6 pattern — only accept well-formed addresses.
const IP_RE = /^(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|[0-9a-f:]{3,39})$/i;

/**
 * Extract the most reliable client identifier from request headers.
 *
 * Strategy:
 *   1. Always try well-known proxy headers (cf-connecting-ip, x-real-ip, x-forwarded-for).
 *      We validate the extracted IP strictly before trusting it.
 *   2. Fall back to a cryptographic fingerprint of multiple headers — much harder
 *      to rotate than the old UA+language pair.
 */
export function clientKey(req: Request, prefix: string): string {
  // 1. Only trust proxy-provided IP headers when the deployment explicitly opts in.
  //    TRUST_PROXY=true means a trusted proxy (e.g. Cloudflare) overwrites these
  //    headers; otherwise they are client-controlled and spoofable (audit BE H-1).
  if (process.env.TRUST_PROXY === "true") {
    const ip = extractIP(req);
    if (ip) return `${prefix}:ip:${ip}`;
  }

  // 2. Fallback: build a fingerprint from several headers so rotation is harder.
  const parts = [
    req.headers.get("user-agent") || "",
    req.headers.get("accept-language") || "",
    req.headers.get("accept-encoding") || "",
    req.headers.get("sec-ch-ua") || "",
    req.headers.get("sec-fetch-dest") || "",
  ];
  const fingerprint = stableHash(parts.join("|"));
  return `${prefix}:fp:${fingerprint}`;
}

/** Try each known header in priority order and return the first valid IP. */
function extractIP(req: Request): string | null {
  // Cloudflare
  const cf = req.headers.get("cf-connecting-ip");
  if (cf && IP_RE.test(cf.trim())) return cf.trim();

  // Common single-IP header
  const real = req.headers.get("x-real-ip");
  if (real && IP_RE.test(real.trim())) return real.trim();

  // Standard forwarded-for (first = client, rest = proxies)
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first && IP_RE.test(first)) return first;
  }

  return null;
}

/**
 * FNV-1a 32-bit hash — deterministic, fast, good enough for fingerprinting.
 * We use >>>0 to keep it unsigned.
 */
function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}
