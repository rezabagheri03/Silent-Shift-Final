import { z } from "zod";
import { ok, fail } from "@/lib/http";
import { isAdmin } from "@/lib/auth";
import { createPodcast, listPodcasts } from "@/lib/repos/podcasts";
import { setPodcastTags } from "@/lib/repos/tags";
import { setChapters } from "@/lib/repos/chapters";
import { slugify } from "@/lib/utils";
import { db } from "@/lib/db";
import type { Podcast } from "@/lib/types";

export const dynamic = "force-dynamic";

const Body = z.object({
  title: z.string().min(2),
  slug: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  summary: z.string().optional(),
  cover_url: z.string().optional(),
  audio_url: z.string().optional(),
  duration_seconds: z.number().int().min(0).optional(),
  episode_number: z.number().int().min(1).nullable().optional(),
  producer: z.string().optional(),
  category_id: z.number().int().nullable().optional(),
  apple_url: z.string().url().optional().or(z.literal("")),
  castbox_url: z.string().url().optional().or(z.literal("")),
  transcript: z.string().optional(),
  tag_ids: z.array(z.number().int()).optional(),
  chapters: z.array(z.object({ title: z.string().min(1), start_seconds: z.number().int().min(0) })).optional(),
});

export async function GET() {
  const session = await isAdmin();
  if (!session) return fail("Unauthorized", 401);
  return ok(listPodcasts({ limit: 500 }));
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
  const { tag_ids, chapters, ...podcastData } = data;
  try {
    let created!: Podcast;
    db.transaction(() => {
      created = createPodcast({
        ...podcastData,
        slug,
        apple_url: data.apple_url || null,
        castbox_url: data.castbox_url || null,
      });
      if (tag_ids) setPodcastTags(created.id, tag_ids);
      if (chapters) setChapters(created.id, chapters);
    })();
    return ok({ ...created, chapters: chapters || [] }, { status: 201 });
  } catch (e: any) {
    const message = String(e?.message ?? "");
    if (message.includes("UNIQUE")) return fail("این شناسه قبلاً ثبت شده است", 409);
    if (message.includes("FOREIGN KEY")) return fail("دسته یا تگ انتخاب‌شده معتبر نیست", 400);
    console.error("[podcasts:create]", e);
    return fail("خطا در ایجاد پادکست", 500);
  }
}
