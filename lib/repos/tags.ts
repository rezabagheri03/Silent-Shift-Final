import { db } from "@/lib/db";

export type Tag = { id: number; slug: string; name: string };

export function listTags(): Tag[] {
  return db.prepare("SELECT * FROM tags ORDER BY name ASC").all() as Tag[];
}

export function getPodcastTags(podcastId: number): Tag[] {
  return db
    .prepare(
      `SELECT t.* FROM tags t
       JOIN podcast_tags pt ON pt.tag_id = t.id
       WHERE pt.podcast_id = ?
       ORDER BY t.name ASC`
    )
    .all(podcastId) as Tag[];
}

export function getArticleTags(articleId: number): Tag[] {
  return db
    .prepare(
      `SELECT t.* FROM tags t
       JOIN article_tags at ON at.tag_id = t.id
       WHERE at.article_id = ?
       ORDER BY t.name ASC`
    )
    .all(articleId) as Tag[];
}

export function setPodcastTags(podcastId: number, tagIds: number[]) {
  const tx = db.transaction(() => {
    db.prepare("DELETE FROM podcast_tags WHERE podcast_id = ?").run(podcastId);
    const ins = db.prepare("INSERT OR IGNORE INTO podcast_tags (podcast_id, tag_id) VALUES (?, ?)");
    for (const id of tagIds) ins.run(podcastId, id);
  });
  tx();
}

export function setArticleTags(articleId: number, tagIds: number[]) {
  const tx = db.transaction(() => {
    db.prepare("DELETE FROM article_tags WHERE article_id = ?").run(articleId);
    const ins = db.prepare("INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)");
    for (const id of tagIds) ins.run(articleId, id);
  });
  tx();
}

export function createTag(input: { slug: string; name: string }): Tag {
  const info = db
    .prepare("INSERT OR IGNORE INTO tags (slug, name) VALUES (?, ?)")
    .run(input.slug, input.name);
  if (info.changes === 0) throw new Error("SQLITE_CONSTRAINT_UNIQUE: tag slug already exists");
  return db
    .prepare("SELECT * FROM tags WHERE slug = ?")
    .get(input.slug) as Tag;
}

export function bulkGetPodcastTagsMap(ids: number[]): Record<number, Tag[]> {
  if (ids.length === 0) return {};
  const placeholders = ids.map(() => "?").join(",");
  const rows = db
    .prepare(
      `SELECT pt.podcast_id, t.id, t.slug, t.name
       FROM podcast_tags pt
       JOIN tags t ON t.id = pt.tag_id
       WHERE pt.podcast_id IN (${placeholders})
       ORDER BY t.name ASC`
    )
    .all(...ids) as (Tag & { podcast_id: number })[];
  const map: Record<number, Tag[]> = {};
  for (const r of rows) {
    (map[r.podcast_id] ||= []).push({ id: r.id, slug: r.slug, name: r.name });
  }
  return map;
}

export function bulkGetArticleTagsMap(ids: number[]): Record<number, Tag[]> {
  if (ids.length === 0) return {};
  const placeholders = ids.map(() => "?").join(",");
  const rows = db
    .prepare(
      `SELECT at.article_id, t.id, t.slug, t.name
       FROM article_tags at
       JOIN tags t ON t.id = at.tag_id
       WHERE at.article_id IN (${placeholders})
       ORDER BY t.name ASC`
    )
    .all(...ids) as (Tag & { article_id: number })[];
  const map: Record<number, Tag[]> = {};
  for (const r of rows) {
    (map[r.article_id] ||= []).push({ id: r.id, slug: r.slug, name: r.name });
  }
  return map;
}
