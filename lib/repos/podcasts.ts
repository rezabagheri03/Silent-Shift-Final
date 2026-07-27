import { db, safeColumnNames } from "@/lib/db";
import type { Paginated, Podcast, SortMode } from "@/lib/types";
import { bulkGetPodcastTagsMap, getPodcastTags } from "@/lib/repos/tags";
import { listChapters } from "@/lib/repos/chapters";

const PODCAST_COLUMNS = [
  "slug", "title", "subtitle", "description", "summary", "cover_url",
  "audio_url", "duration_seconds", "episode_number", "producer",
  "category_id", "apple_url", "castbox_url", "transcript", "published_at",
] as const;

const BASE_SELECT = `
  SELECT p.*, c.name AS category_name, c.slug AS category_slug
  FROM podcasts p
  LEFT JOIN categories c ON c.id = p.category_id
`;

export function listPodcasts(opts: {
  category?: string;
  tag?: string;
  sort?: SortMode;
  page?: number;
  limit?: number;
  q?: string;
}): Paginated<Podcast> {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(500, Math.max(1, opts.limit ?? 10));
  const offset = (page - 1) * limit;

  const where: string[] = [];
  const params: Record<string, unknown> = {};
  const joins: string[] = [];

  if (opts.category) {
    where.push("c.slug = @category");
    params.category = opts.category;
  }
  if (opts.tag) {
    joins.push("JOIN podcast_tags pt ON pt.podcast_id = p.id JOIN tags t ON t.id = pt.tag_id");
    where.push("t.slug = @tag");
    params.tag = opts.tag;
  }
  if (opts.q && opts.q.trim()) {
    where.push("(p.title LIKE @q OR p.description LIKE @q OR p.summary LIKE @q)");
    params.q = `%${opts.q.trim()}%`;
  }

  const joinSql = joins.join(" ");
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const orderBy =
    opts.sort === "popular"
      ? "p.play_count DESC, p.published_at DESC"
      : "p.published_at DESC";

  const items = db
    .prepare(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM podcasts p
       LEFT JOIN categories c ON c.id = p.category_id
       ${joinSql}
       ${whereSql}
       GROUP BY p.id
       ORDER BY ${orderBy} LIMIT @limit OFFSET @offset`
    )
    .all({ ...params, limit, offset }) as Podcast[];

  // Hydrate tags in one query
  const tagMap = bulkGetPodcastTagsMap(items.map((i) => i.id));
  for (const p of items) p.tags = tagMap[p.id] || [];

  const total = (
    db
      .prepare(
        `SELECT COUNT(DISTINCT p.id) AS n
         FROM podcasts p
         LEFT JOIN categories c ON c.id = p.category_id
         ${joinSql}
         ${whereSql}`
      )
      .get(params) as { n: number }
  ).n;

  return { items, page, limit, total, total_pages: Math.max(1, Math.ceil(total / limit)) };
}

export function getPodcastBySlug(slug: string): Podcast | null {
  const row = db.prepare(`${BASE_SELECT} WHERE p.slug = ?`).get(slug) as Podcast | undefined;
  if (!row) return null;
  row.tags = getPodcastTags(row.id);
  row.chapters = listChapters(row.id).map((c) => ({
    id: c.id,
    title: c.title,
    start_seconds: c.start_seconds,
  }));
  return row;
}

/** Full update (partial patch). Only provided fields are updated. */
export function updatePodcast(
  id: number,
  patch: Partial<{
    slug: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    summary: string | null;
    cover_url: string | null;
    audio_url: string | null;
    duration_seconds: number;
    episode_number: number | null;
    producer: string | null;
    category_id: number | null;
    apple_url: string | null;
    castbox_url: string | null;
    transcript: string | null;
    published_at: string;
  }>
): boolean {
  const rawKeys = Object.keys(patch);
  if (rawKeys.length === 0) return false;
  const keys = safeColumnNames(rawKeys, PODCAST_COLUMNS);
  const setSql = keys.map((k) => `${k} = @${k}`).join(", ");
  const info = db
    .prepare(`UPDATE podcasts SET ${setSql} WHERE id = @id`)
    .run({ ...patch, id });
  return info.changes > 0;
}

export function getPodcastById(id: number): Podcast | null {
  const row = db.prepare(`${BASE_SELECT} WHERE p.id = ?`).get(id) as Podcast | undefined;
  if (!row) return null;
  row.tags = getPodcastTags(row.id);
  return row;
}

export function getLatestPodcast(): Podcast | null {
  const row = db
    .prepare(`${BASE_SELECT} ORDER BY p.published_at DESC LIMIT 1`)
    .get() as Podcast | undefined;
  if (!row) return null;
  row.tags = getPodcastTags(row.id);
  return row;
}

export function incrementPlayCount(slug: string): number {
  const row = db
    .prepare(
      `UPDATE podcasts SET play_count = play_count + 1 WHERE slug = ?
       RETURNING play_count`
    )
    .get(slug) as { play_count: number } | undefined;
  return row?.play_count ?? 0;
}

export function getRelatedPodcasts(podcastId: number, limit = 3): Podcast[] {
  const target = db
    .prepare("SELECT category_id FROM podcasts WHERE id = @id")
    .get({ id: podcastId }) as { category_id: number | null } | undefined;
  if (!target) return [];
  const rows = db
    .prepare(
      `${BASE_SELECT}
       WHERE p.id != @podcastId AND (@cat IS NULL OR p.category_id = @cat)
       ORDER BY p.published_at DESC LIMIT @limit`
    )
    .all({ podcastId, cat: target.category_id, limit }) as Podcast[];
  const tagMap = bulkGetPodcastTagsMap(rows.map((row) => row.id));
  rows.forEach((row) => { row.tags = tagMap[row.id] || []; });
  return rows;
}

/** N most-recent podcasts in the same category as `podcastId`, excluding it. */
export function getAdjacentEpisodes(podcastId: number, limit = 5): Podcast[] {
  const target = db
    .prepare("SELECT category_id FROM podcasts WHERE id = @id")
    .get({ id: podcastId }) as { category_id: number | null } | undefined;
  if (!target) return [];
  const rows = db
    .prepare(
      `${BASE_SELECT}
       WHERE p.id != @podcastId AND (@cat IS NULL OR p.category_id = @cat)
       ORDER BY p.published_at DESC LIMIT @limit`
    )
    .all({ podcastId, cat: target.category_id, limit }) as Podcast[];
  const tagMap = bulkGetPodcastTagsMap(rows.map((row) => row.id));
  rows.forEach((row) => { row.tags = tagMap[row.id] || []; });
  return rows;
}

/** Used when an article needs "related podcasts" by the article's category. */
export function getPodcastsByCategoryId(categoryId: number | null, limit = 3): Podcast[] {
  const rows = (!categoryId
    ? db.prepare(`${BASE_SELECT} ORDER BY p.published_at DESC LIMIT ?`).all(limit)
    : db.prepare(`${BASE_SELECT} WHERE p.category_id = ? ORDER BY p.published_at DESC LIMIT ?`).all(categoryId, limit)) as Podcast[];
  const tagMap = bulkGetPodcastTagsMap(rows.map((row) => row.id));
  rows.forEach((row) => { row.tags = tagMap[row.id] || []; });
  return rows;
}

export function createPodcast(input: {
  slug: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  summary?: string | null;
  cover_url?: string | null;
  audio_url?: string | null;
  duration_seconds?: number;
  episode_number?: number | null;
  producer?: string | null;
  category_id?: number | null;
  apple_url?: string | null;
  castbox_url?: string | null;
  transcript?: string | null;
  published_at?: string;
}): Podcast {
  const info = db
    .prepare(
      `INSERT INTO podcasts (slug, title, subtitle, description, summary, cover_url, audio_url,
         duration_seconds, episode_number, producer, category_id, apple_url, castbox_url, transcript, published_at)
       VALUES (@slug, @title, @subtitle, @description, @summary, @cover_url, @audio_url,
         @duration_seconds, @episode_number, @producer, @category_id, @apple_url, @castbox_url, @transcript,
         COALESCE(@published_at, CURRENT_TIMESTAMP))`
    )
    .run({
      slug: input.slug,
      title: input.title,
      subtitle: input.subtitle ?? null,
      description: input.description ?? null,
      summary: input.summary ?? null,
      cover_url: input.cover_url ?? null,
      audio_url: input.audio_url ?? null,
      duration_seconds: input.duration_seconds ?? 0,
      episode_number: input.episode_number ?? null,
      producer: input.producer ?? null,
      category_id: input.category_id ?? null,
      apple_url: input.apple_url ?? null,
      castbox_url: input.castbox_url ?? null,
      transcript: input.transcript ?? null,
      published_at: input.published_at ?? null,
    });
  return getPodcastBySlug(input.slug) ?? ({ id: Number(info.lastInsertRowid) } as Podcast);
}

export function deletePodcast(id: number): boolean {
  return db.prepare("DELETE FROM podcasts WHERE id = ?").run(id).changes > 0;
}
