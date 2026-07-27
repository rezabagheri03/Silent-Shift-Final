import { z } from "zod";
import { db, safeColumnNames } from "@/lib/db";
import { ok, fail } from "@/lib/http";
import { isAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

const TAG_COLUMNS = ["name", "slug"] as const;

export const dynamic = "force-dynamic";

const Patch = z.object({ name: z.string().min(1).optional(), slug: z.string().optional() });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await isAdmin();
  if (!session) return fail("Unauthorized", 401);
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return fail("شناسه نامعتبر است", 400);
  if (!db.prepare("SELECT 1 FROM tags WHERE id = ?").get(id)) return fail("پیدا نشد", 404);
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail("درخواست نامعتبر است", 400);
  }
  const parsed = Patch.safeParse(json);
  if (!parsed.success) return fail("ورودی نامعتبر است", 400);
  const patch: Record<string, string> = {};
  if (parsed.data.name !== undefined) patch.name = parsed.data.name.trim();
  if (parsed.data.slug !== undefined) patch.slug = slugify(parsed.data.slug);
  if (Object.keys(patch).length === 0) return ok({ updated: false });
  const keys = safeColumnNames(Object.keys(patch), TAG_COLUMNS);
  const setSql = keys.map((k) => `${k} = @${k}`).join(", ");
  try {
    db.prepare(`UPDATE tags SET ${setSql} WHERE id = @id`).run({ ...patch, id });
    return ok({ updated: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("UNIQUE")) return fail("این شناسه قبلاً ثبت شده است", 409);
    return fail("خطا در ویرایش", 500);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await isAdmin();
  if (!session) return fail("Unauthorized", 401);
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return fail("شناسه نامعتبر است", 400);
  const info = db.prepare("DELETE FROM tags WHERE id = ?").run(id);
  if (info.changes === 0) return fail("پیدا نشد", 404);
  return ok({ deleted: true });
}
