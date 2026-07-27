import { z } from "zod";
import { ok, fail } from "@/lib/http";
import { isAdmin } from "@/lib/auth";
import { deletePodcast, getPodcastById, updatePodcast } from "@/lib/repos/podcasts";
import { setPodcastTags, getPodcastTags } from "@/lib/repos/tags";
import { setChapters, listChapters } from "@/lib/repos/chapters";
import { slugify } from "@/lib/utils";
import { db } from "@/lib/db";
import { removeLocalUpload } from "@/lib/uploads";

export const dynamic = "force-dynamic";

const PatchBody = z.object({
  title: z.string().min(2).optional(),
  slug: z.string().optional(),
  subtitle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  cover_url: z.string().nullable().optional(),
  audio_url: z.string().nullable().optional(),
  duration_seconds: z.number().int().min(0).optional(),
  episode_number: z.number().int().min(1).nullable().optional(),
  producer: z.string().nullable().optional(),
  category_id: z.number().int().nullable().optional(),
  apple_url: z.string().nullable().optional(),
  castbox_url: z.string().nullable().optional(),
  transcript: z.string().nullable().optional(),
  tag_ids: z.array(z.number().int()).optional(),
  chapters: z
    .array(z.object({ title: z.string().min(1), start_seconds: z.number().int().min(0) }))
    .optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await isAdmin();
  if (!session) return fail("Unauthorized", 401);
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return fail("شناسه نامعتبر است", 400);
  const podcast = getPodcastById(id);
  if (!podcast) return fail("پیدا نشد", 404);
  return ok({
    ...podcast,
    tags: getPodcastTags(id),
    chapters: listChapters(id).map((c) => ({
      id: c.id,
      title: c.title,
      start_seconds: c.start_seconds,
    })),
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await isAdmin();
  if (!session) return fail("Unauthorized", 401);
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return fail("شناسه نامعتبر است", 400);
  const existing = getPodcastById(id);
  if (!existing) return fail("پیدا نشد", 404);

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail("درخواست نامعتبر است", 400);
  }
  const parsed = PatchBody.safeParse(json);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "ورودی نامعتبر است", 400);

  const { tag_ids, chapters, slug, title, ...rest } = parsed.data;
  const patch: Record<string, unknown> = { ...rest };
  if (title !== undefined) patch.title = title;
  if (slug !== undefined) patch.slug = slug.trim() ? slugify(slug) : slugify(title ?? "");

  try {
    db.transaction(() => {
      if (Object.keys(patch).length > 0) {
        updatePodcast(id, patch as Parameters<typeof updatePodcast>[1]);
      }
      if (tag_ids) setPodcastTags(id, tag_ids);
      if (chapters) setChapters(id, chapters);
    })();
    const fresh = getPodcastById(id);
    if (patch.cover_url !== undefined && patch.cover_url !== existing.cover_url) await removeLocalUpload(existing.cover_url);
    if (patch.audio_url !== undefined && patch.audio_url !== existing.audio_url) await removeLocalUpload(existing.audio_url);
    return ok({
      ...fresh,
      tags: fresh ? getPodcastTags(fresh.id) : [],
      chapters: fresh
        ? listChapters(fresh.id).map((c) => ({
            id: c.id,
            title: c.title,
            start_seconds: c.start_seconds,
          }))
        : [],
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("UNIQUE")) return fail("این شناسه قبلاً ثبت شده است", 409);
    if (msg.includes("FOREIGN KEY")) return fail("دسته یا تگ انتخاب‌شده معتبر نیست", 400);
    console.error("[podcasts:update]", e);
    return fail("خطا در ذخیره پادکست", 500);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await isAdmin();
  if (!session) return fail("Unauthorized", 401);
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return fail("شناسه نامعتبر است", 400);
  const existing = getPodcastById(id);
  if (!existing) return fail("پیدا نشد", 404);
  const okDel = deletePodcast(id);
  if (!okDel) return fail("پیدا نشد", 404);
  await Promise.all([
    removeLocalUpload(existing.cover_url),
    removeLocalUpload(existing.audio_url),
  ]);
  return ok({ deleted: true });
}
