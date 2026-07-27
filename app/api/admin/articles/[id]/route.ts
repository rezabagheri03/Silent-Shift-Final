import { z } from "zod";
import { ok, fail } from "@/lib/http";
import { isAdmin } from "@/lib/auth";
import { deleteArticle, getArticleById, updateArticle } from "@/lib/repos/articles";
import { setArticleTags, getArticleTags } from "@/lib/repos/tags";
import { slugify } from "@/lib/utils";
import { db } from "@/lib/db";
import { removeLocalUpload } from "@/lib/uploads";

export const dynamic = "force-dynamic";

const PatchBody = z.object({
  title: z.string().min(2).optional(),
  slug: z.string().optional(),
  excerpt: z.string().nullable().optional(),
  body: z.string().min(10).optional(),
  cover_url: z.string().nullable().optional(),
  author: z.string().nullable().optional(),
  category_id: z.number().int().nullable().optional(),
  read_time_minutes: z.number().int().min(1).nullable().optional(),
  tag_ids: z.array(z.number().int()).optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await isAdmin();
  if (!session) return fail("Unauthorized", 401);
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return fail("شناسه نامعتبر است", 400);
  const article = getArticleById(id);
  if (!article) return fail("پیدا نشد", 404);
  return ok({ ...article, tags: getArticleTags(id) });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await isAdmin();
  if (!session) return fail("Unauthorized", 401);
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return fail("شناسه نامعتبر است", 400);
  const existing = getArticleById(id);
  if (!existing) return fail("پیدا نشد", 404);

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail("درخواست نامعتبر است", 400);
  }
  const parsed = PatchBody.safeParse(json);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "ورودی نامعتبر است", 400);

  const { tag_ids, slug, title, ...rest } = parsed.data;
  const patch: Record<string, unknown> = { ...rest };
  if (title !== undefined) patch.title = title;
  if (slug !== undefined) patch.slug = slug.trim() ? slugify(slug) : slugify(title ?? "");

  try {
    db.transaction(() => {
      if (Object.keys(patch).length > 0) {
        updateArticle(id, patch as Parameters<typeof updateArticle>[1]);
      }
      if (tag_ids) setArticleTags(id, tag_ids);
    })();
    const fresh = getArticleById(id);
    if (patch.cover_url !== undefined && patch.cover_url !== existing.cover_url) await removeLocalUpload(existing.cover_url);
    return ok({ ...fresh, tags: fresh ? getArticleTags(fresh.id) : [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("UNIQUE")) return fail("این شناسه قبلاً ثبت شده است", 409);
    if (msg.includes("FOREIGN KEY")) return fail("دسته یا تگ انتخاب‌شده معتبر نیست", 400);
    console.error("[articles:update]", e);
    return fail("خطا در ذخیره روایت", 500);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await isAdmin();
  if (!session) return fail("Unauthorized", 401);
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return fail("شناسه نامعتبر است", 400);
  const existing = getArticleById(id);
  if (!existing) return fail("پیدا نشد", 404);
  const okDel = deleteArticle(id);
  if (!okDel) return fail("پیدا نشد", 404);
  await removeLocalUpload(existing.cover_url);
  return ok({ deleted: true });
}
