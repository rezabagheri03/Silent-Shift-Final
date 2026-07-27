import { NextResponse } from "next/server";
import { readFile, unlink } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, tooMany } from "@/lib/http";
import { rateLimit, clientKey } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

/** Create a transactionally consistent snapshot, including data still in WAL. */
export async function GET(req: Request) {
  const session = await isAdmin();
  if (!session) return fail("Unauthorized", 401);

  // Strict rate limit: max 5 backup downloads per hour per admin session
  const rl = rateLimit(clientKey(req, "backup"), { windowSeconds: 3600, max: 5 });
  if (!rl.ok) return tooMany(rl.retry_after_seconds);

  const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(process.cwd(), "data");
  const snapshot = path.join(dataDir, `.backup-${crypto.randomBytes(8).toString("hex")}.db`);
  try {
    await db.backup(snapshot);
    const buffer = await readFile(snapshot);
    const date = new Date().toISOString().split("T")[0];
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.sqlite3",
        "Content-Disposition": `attachment; filename="silent-shift-backup-${date}.db"`,
        "Cache-Control": "no-store",
        "Content-Length": String(buffer.byteLength),
      },
    });
  } catch {
    return fail("ساخت فایل پشتیبان ناموفق بود", 500);
  } finally {
    await unlink(snapshot).catch(() => {});
  }
}
