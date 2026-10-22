/**
 * Publish the two gold-standard examples (article + episode) into the live DB.
 * Idempotent: it updates the rows with the same slugs, never creates new ones
 * and never touches anything else. Safe to re-run.
 */
import { db } from "@/lib/db";
import { EXAMPLE_ARTICLE, EXAMPLE_EPISODE } from "@/lib/content-examples";
import { estimateReadingTime } from "@/lib/reading-time";

function categoryId(slug: string): number | null {
  const row = db.prepare("SELECT id FROM categories WHERE slug = ?").get(slug) as { id: number } | undefined;
  return row?.id ?? null;
}

function tagId(slug: string): number | null {
  const row = db.prepare("SELECT id FROM tags WHERE slug = ?").get(slug) as { id: number } | undefined;
  return row?.id ?? null;
}

function requireRow(table: "articles" | "podcasts", slug: string): number {
  const row = db.prepare(`SELECT id FROM ${table} WHERE slug = ?`).get(slug) as { id: number } | undefined;
  if (!row) throw new Error(`${table}: no row with slug "${slug}" — run npm run seed first`);
  return row.id;
}

db.transaction(() => {
  const articleId = requireRow("articles", EXAMPLE_ARTICLE.slug);
  db.prepare(
    `UPDATE articles
        SET title = ?, excerpt = ?, body = ?, cover_url = ?, author = ?,
            category_id = ?, read_time_minutes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`
  ).run(
    EXAMPLE_ARTICLE.title,
    EXAMPLE_ARTICLE.excerpt,
    EXAMPLE_ARTICLE.body,
    EXAMPLE_ARTICLE.cover_url,
    EXAMPLE_ARTICLE.author,
    categoryId(EXAMPLE_ARTICLE.category_slug),
    estimateReadingTime(EXAMPLE_ARTICLE.body),
    articleId
  );
  db.prepare("DELETE FROM article_tags WHERE article_id = ?").run(articleId);
  for (const slug of EXAMPLE_ARTICLE.tags) {
    const id = tagId(slug);
    if (id) db.prepare("INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)").run(articleId, id);
  }

  const podcastId = requireRow("podcasts", EXAMPLE_EPISODE.slug);
  db.prepare(
    `UPDATE podcasts
        SET title = ?, subtitle = ?, description = ?, summary = ?, transcript = ?,
            duration_seconds = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`
  ).run(
    EXAMPLE_EPISODE.title,
    EXAMPLE_EPISODE.subtitle,
    EXAMPLE_EPISODE.description,
    EXAMPLE_EPISODE.summary,
    EXAMPLE_EPISODE.transcript,
    EXAMPLE_EPISODE.duration_seconds,
    podcastId
  );
  db.prepare("DELETE FROM podcast_tags WHERE podcast_id = ?").run(podcastId);
  for (const slug of EXAMPLE_EPISODE.tags) {
    const id = tagId(slug);
    if (id) db.prepare("INSERT INTO podcast_tags (podcast_id, tag_id) VALUES (?, ?)").run(podcastId, id);
  }
  // The only audio is a 3-second sample: chapter timestamps beyond it would be fake.
  db.prepare("DELETE FROM chapters WHERE podcast_id = ?").run(podcastId);
})();

console.log(
  JSON.stringify(
    {
      article: { slug: EXAMPLE_ARTICLE.slug, words: EXAMPLE_ARTICLE.body.split(/\s+/).length },
      episode: { slug: EXAMPLE_EPISODE.slug, duration_seconds: EXAMPLE_EPISODE.duration_seconds },
    },
    null,
    2
  )
);
