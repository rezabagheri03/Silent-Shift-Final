import { z } from "zod";
import { ok, fail } from "@/lib/http";
import { isAdmin } from "@/lib/auth";
import { createArticle, listArticles } from "@/lib/repos/articles";
import { setArticleTags } from "@/lib/repos/tags";
import { slugify } from "@/lib/utils";
import { db } from "@/lib/db";
import type { Article } from "@/lib/types";

export const dynamic = "force-dynamic";

const Body = z.object({
  title: z.string().min(2),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  body: z.string().min(10),
  cover_url: z.string().optional(),
  author: z.string().optional(),
  category_id: z.number().int().nullable().optional(),
  read_time_minutes: z.number().int().min(1).nullable().optional(),
  tag_ids: z.array(z.number().int()).optional(),
});

export async function GET() {
  const session = await isAdmin();
  if (!session) return fail("Unauthorized", 401);
  return ok(listArticles({ limit: 500 }));
}

export async function POST(req: Request) {
  const session = await isAdmin();
  if (!session) return fail("Unauthorized", 401);

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail("درخواست نامعتبر است", 400);
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "ورودی نامعتبر است", 400);

  const data = parsed.data;
  const slug = data.slug && data.slug.trim() ? slugify(data.slug) : slugify(data.title);
  const { tag_ids, ...articleData } = data;
  try {
    let created!: Article;
    db.transaction(() => {
      created = createArticle({ ...articleData, slug });
      if (tag_ids) setArticleTags(created.id, tag_ids);
    })();
    return ok(created, { status: 201 });
  } catch (e: any) {
    const message = String(e?.message ?? "");
    if (message.includes("UNIQUE")) return fail("این شناسه قبلاً ثبت شده است", 409);
    if (message.includes("FOREIGN KEY")) return fail("دسته یا تگ انتخاب‌شده معتبر نیست", 400);
    console.error("[articles:create]", e);
    return fail("خطا در ایجاد روایت", 500);
  }
}
