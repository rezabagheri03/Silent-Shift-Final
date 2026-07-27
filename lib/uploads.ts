import path from "node:path";
import { readdir, stat, unlink } from "node:fs/promises";

const UPLOAD_ROOT = path.resolve(
  process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads")
);

export function uploadRoot() {
  return UPLOAD_ROOT;
}

// In-memory cache for disk usage to avoid scanning on every upload.
let usageCache: { value: number; timestamp: number } | null = null;
const USAGE_CACHE_TTL_MS = 30_000; // 30 seconds

export async function getUploadUsage(dir = UPLOAD_ROOT): Promise<number> {
  // Return cached value if still fresh (only for root-level calls)
  if (dir === UPLOAD_ROOT && usageCache && Date.now() - usageCache.timestamp < USAGE_CACHE_TTL_MS) {
    return usageCache.value;
  }

  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  let total = 0;
  for (const entry of entries) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) total += await getUploadUsage(target);
    else if (entry.isFile()) total += (await stat(target)).size;
  }

  // Cache only root-level results
  if (dir === UPLOAD_ROOT) {
    usageCache = { value: total, timestamp: Date.now() };
  }
  return total;
}

/** Invalidate the usage cache (call after upload/delete). */
export function invalidateUsageCache() {
  usageCache = null;
}

export async function removeLocalUpload(url: string | null | undefined) {
  if (!url?.startsWith("/uploads/")) return;
  const relative = url.slice("/uploads/".length);
  // Normalise URL-style forward slashes to the OS separator before resolving
  const osRelative = path.normalize(relative);
  const target = path.resolve(UPLOAD_ROOT, osRelative);
  // Always compare with trailing separator to prevent prefix spoofing (e.g. /uploads-evil/)
  const rootWithSep = UPLOAD_ROOT.endsWith(path.sep) ? UPLOAD_ROOT : UPLOAD_ROOT + path.sep;
  if (!target.startsWith(rootWithSep) && target !== UPLOAD_ROOT) return;
  try {
    await unlink(target);
  } catch (error: unknown) {
    // Best-effort cleanup: log non-ENOENT errors but don't throw — the DB
    // transaction has already committed, so this is just housekeeping.
    const e = error as NodeJS.ErrnoException;
    if (e.code !== "ENOENT") {
      console.warn(`[uploads] could not remove old file ${target}: ${e.message}`);
    }
  }
  // Invalidate cache since disk usage changed
  invalidateUsageCache();
}
