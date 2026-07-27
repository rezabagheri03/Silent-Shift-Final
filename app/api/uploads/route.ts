import { NextRequest } from "next/server";
import { mkdir } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { ok, fail, tooMany } from "@/lib/http";
import { isAdmin } from "@/lib/auth";
import { getUploadUsage, uploadRoot, invalidateUsageCache } from "@/lib/uploads";
import { rateLimit, clientKey } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

type UploadCfg = { dir: string; extensions: Record<string, string>; maxBytes: number };

const ALLOWED: Record<string, UploadCfg> = {
  cover: {
    dir: "covers",
    extensions: {
      "image/png": ".png",
      "image/jpeg": ".jpg",
      "image/webp": ".webp",
    },
    maxBytes: 5 * 1024 * 1024,
  },
  audio: {
    dir: "audio",
    extensions: {
      "audio/mpeg": ".mp3",
      "audio/mp4": ".m4a",
      "audio/x-m4a": ".m4a",
      "audio/wav": ".wav",
      "audio/ogg": ".ogg",
    },
    maxBytes: 200 * 1024 * 1024,
  },
};

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return fail("احراز هویت ناموفق", 401);

  // Rate limit: max 20 uploads per hour per admin
  const rl = rateLimit(clientKey(req, "upload"), { windowSeconds: 3600, max: 20 });
  if (!rl.ok) return tooMany(rl.retry_after_seconds);

  const declaredLength = Number(req.headers.get("content-length") || 0);
  const absoluteMax = ALLOWED.audio.maxBytes + 1024 * 1024;
  // Reject if Content-Length is declared AND exceeds max (missing header is handled later by file.size check)
  if (declaredLength > absoluteMax) return fail("حجم درخواست بیش از حد مجاز است", 413);

  const form = await req.formData().catch(() => null);
  if (!form) return fail("درخواست نامعتبر است", 400);

  const file = form.get("file");
  const kind = String(form.get("kind") ?? "cover");
  if (!(file instanceof File)) return fail("فایلی ارسال نشده است", 400);

  const cfg = ALLOWED[kind];
  if (!cfg) return fail("نوع آپلود نامعتبر است", 400);
  const extension = cfg.extensions[file.type];
  if (!extension) return fail(`نوع فایل مجاز نیست: ${file.type || "unknown"}`, 415);
  if (file.size > cfg.maxBytes) return fail("حجم فایل بیش از حد مجاز است", 413);
  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (!matchesSignature(file.type, header)) return fail("محتوای فایل با نوع اعلام‌شده مطابقت ندارد", 415);
  const quota = Number(process.env.MAX_UPLOAD_STORAGE_BYTES || 1024 * 1024 * 1024);
  if ((await getUploadUsage()) + file.size > quota) return fail("فضای ذخیره‌سازی آپلودها پر شده است", 507);

  const name = `${Date.now()}-${crypto.randomBytes(12).toString("hex")}${extension}`;
  const dir = path.join(uploadRoot(), cfg.dir);
  await mkdir(dir, { recursive: true });
  const destination = path.join(dir, name);

  try {
    const stream = Readable.fromWeb(file.stream() as any);
    await pipeline(stream, createWriteStream(destination, { flags: "wx", mode: 0o640 }));
  } catch {
    return fail("خطا در ذخیره فایل", 500);
  }

  invalidateUsageCache();
  return ok({ url: `/uploads/${cfg.dir}/${name}`, size: file.size, type: file.type });
}

function matchesSignature(type: string, bytes: Uint8Array) {
  const ascii = (start: number, length: number) => String.fromCharCode(...bytes.slice(start, start + length));
  if (type === "image/png") return bytes[0] === 0x89 && ascii(1, 3) === "PNG";
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/webp") return ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP";
  if (type === "audio/wav") return ascii(0, 4) === "RIFF" && ascii(8, 4) === "WAVE";
  if (type === "audio/ogg") return ascii(0, 4) === "OggS";
  if (type === "audio/mp4" || type === "audio/x-m4a") return ascii(4, 4) === "ftyp";
  if (type === "audio/mpeg") return ascii(0, 3) === "ID3" || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0);
  return false;
}
