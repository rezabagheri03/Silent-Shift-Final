import { db, safeColumnNames } from "@/lib/db";
import type { Article, Paginated, SortMode } from "@/lib/types";
import { bulkGetArticleTagsMap, getArticleTags } from "@/lib/repos/tags";

const ARTICLE_COLUMNS = [
  "slug", "title", "excerpt", "body", "cover_url", "author",
  "category_id", "read_time_minutes", "published_at",
] as const;

const BASE_SELECT = `
  SELECT a.*, c.name AS category_name, c.slug AS category_slug
  FROM articles a
  LEFT JOIN categories c ON c.id = a.category_id
`;

export function listArticles(opts: {
  category?: string;
  tag?: string;
  sort?: SortMode;
  page?: number;
  limit?: number;
  q?: string;
}): Paginated<Article> {
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
    joins.push("JOIN article_tags at2 ON at2.article_id = a.id JOIN tags t ON t.id = at2.tag_id");
    where.push("t.slug = @tag");
    params.tag = opts.tag;
  }
  if (opts.q && opts.q.trim()) {
    where.push("(a.title LIKE @q OR a.excerpt LIKE @q OR a.body LIKE @q)");
    params.q = `%${opts.q.trim()}%`;
  }

  const joinSql = joins.join(" ");
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const orderBy =
    opts.sort === "popular"
      ? "a.view_count DESC, a.published_at DESC"
      : "a.published_at DESC";

  const items = db
    .prepare(
      `SELECT a.*, c.name AS category_name, c.slug AS category_slug
       FROM articles a
       LEFT JOIN categories c ON c.id = a.category_id
       ${joinSql}
       ${whereSql}
       GROUP BY a.id
       ORDER BY ${orderBy} LIMIT @limit OFFSET @offset`
    )
    .all({ ...params, limit, offset }) as Article[];

  const tagMap = bulkGetArticleTagsMap(items.map((i) => i.id));
  for (const a of items) a.tags = tagMap[a.id] || [];

  const total = (
    db
      .prepare(
        `SELECT COUNT(DISTINCT a.id) AS n
         FROM articles a
         LEFT JOIN categories c ON c.id = a.category_id
         ${joinSql}
         ${whereSql}`
      )
      .get(params) as { n: number }
  ).n;

  return { items, page, limit, total, total_pages: Math.max(1, Math.ceil(total / limit)) };
}

/** Pure fetch — no side effects. Use this everywhere internally. */
export function getArticleBySlug(slug: string): Article | null {
  const row = db.prepare(`${BASE_SELECT} WHERE a.slug = ?`).get(slug) as Article | undefined;
  if (!row) return null;
  row.tags = getArticleTags(row.id);
  return row;
}

/** Explicit view-count bump, called only by the public page route. */
export function incrementArticleView(slug: string): number {
  const row = db
    .prepare(
      `UPDATE articles SET view_count = view_count + 1 WHERE slug = ?
       RETURNING view_count`
    )
    .get(slug) as { view_count: number } | undefined;
  return row?.view_count ?? 0;
}

export function getRelatedArticles(articleId: number, limit = 3): Article[] {
  const target = db
    .prepare("SELECT category_id FROM articles WHERE id = @id")
    .get({ id: articleId }) as { category_id: number | null } | undefined;
  if (!target) return [];
  const rows = db
    .prepare(
      `${BASE_SELECT}
       WHERE a.id != @articleId AND (@cat IS NULL OR a.category_id = @cat)
       ORDER BY a.published_at DESC LIMIT @limit`
    )
    .all({ articleId, cat: target.category_id, limit }) as Article[];
  const tagMap = bulkGetArticleTagsMap(rows.map((row) => row.id));
  rows.forEach((row) => { row.tags = tagMap[row.id] || []; });
  return rows;
}

export function createArticle(input: {
  slug: string;
  title: string;
  excerpt?: string | null;
  body: string;
  cover_url?: string | null;
  author?: string | null;
  category_id?: number | null;
  read_time_minutes?: number | null;
  published_at?: string;
}): Article {
  const info = db
    .prepare(
      `INSERT INTO articles (slug, title, excerpt, body, cover_url, author, category_id, read_time_minutes, published_at)
       VALUES (@slug, @title, @excerpt, @body, @cover_url, @author, @category_id, @read_time_minutes, COALESCE(@published_at, CURRENT_TIMESTAMP))`
    )
    .run({
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt ?? null,
      body: input.body,
      cover_url: input.cover_url ?? null,
      author: input.author ?? null,
      category_id: input.category_id ?? null,
      read_time_minutes: input.read_time_minutes ?? null,
      published_at: input.published_at ?? null,
    });
  return getArticleBySlug(input.slug) ?? ({ id: Number(info.lastInsertRowid) } as Article);
}

export function deleteArticle(id: number): boolean {
  return db.prepare("DELETE FROM articles WHERE id = ?").run(id).changes > 0;
}

export function getArticleById(id: number): Article | null {
  const row = db.prepare(`${BASE_SELECT} WHERE a.id = ?`).get(id) as Article | undefined;
  if (!row) return null;
  return row;
}

export function updateArticle(
  id: number,
  patch: Partial<{
    slug: string;
    title: string;
    excerpt: string | null;
    body: string;
    cover_url: string | null;
    author: string | null;
    category_id: number | null;
    read_time_minutes: number | null;
    published_at: string;
  }>
): boolean {
  const rawKeys = Object.keys(patch);
  if (rawKeys.length === 0) return false;
  const keys = safeColumnNames(rawKeys, ARTICLE_COLUMNS);
  const setSql = keys.map((k) => `${k} = @${k}`).join(", ");
  const info = db
    .prepare(`UPDATE articles SET ${setSql} WHERE id = @id`)
    .run({ ...patch, id });
  return info.changes > 0;
}
