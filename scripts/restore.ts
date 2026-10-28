/**
 * Restore a rescue dump taken from the previous deployment (harvested via the public API,
 * plus admin-only messages/subscribers). Run AFTER `npm run seed` so the bootstrap admin exists;
 * this only replaces content, never admins.
 *
 *   npx tsx scripts/restore.ts [path/to/dump.json]
 */
import { db } from "@/lib/db";
import fs from "node:fs";

const dumpPath = process.argv[2] ?? "data/restore-dump.json";
if (!fs.existsSync(dumpPath)) {
  console.error(`dump not found: ${dumpPath}`);
  process.exit(1);
}
const dump = JSON.parse(fs.readFileSync(dumpPath, "utf8"));

const pick = (row: Record<string, unknown>, keys: string[]) => {
  const out: Record<string, unknown> = {};
  for (const k of keys) out[k] = row[k] ?? null;
  return out;
};

const importDump = db.transaction(() => {
  // Content tables only — admins (created by seed) and rate limits are left alone.
  db.exec(`
    DELETE FROM podcast_tags; DELETE FROM article_tags; DELETE FROM chapters;
    DELETE FROM podcasts; DELETE FROM articles;
    DELETE FROM tags; DELETE FROM categories;
    DELETE FROM faqs;
    DELETE FROM contact_messages; DELETE FROM newsletter_subscribers;
  `);

  const insertCategory = db.prepare("INSERT INTO categories (id, slug, name) VALUES (@id, @slug, @name)");
  for (const c of dump.categories.data) insertCategory.run(pick(c, ["id", "slug", "name"]));

  const tags = new Map<number, Record<string, unknown>>();
  for (const item of [...dump.podcasts, ...dump.articles]) {
    for (const t of item.tags ?? []) tags.set(t.id as number, t);
  }
  const insertTag = db.prepare("INSERT INTO tags (id, slug, name) VALUES (@id, @slug, @name)");
  for (const t of tags.values()) insertTag.run(pick(t, ["id", "slug", "name"]));

  const insertPodcast = db.prepare(`
    INSERT INTO podcasts (id, slug, title, subtitle, description, summary, cover_url, audio_url,
      duration_seconds, producer, category_id, apple_url, castbox_url, transcript, play_count,
      published_at, created_at, episode_number, updated_at)
    VALUES (@id, @slug, @title, @subtitle, @description, @summary, @cover_url, @audio_url,
      @duration_seconds, @producer, @category_id, @apple_url, @castbox_url, @transcript, @play_count,
      @published_at, @created_at, @episode_number, @updated_at)`);
  const linkPodcastTag = db.prepare("INSERT INTO podcast_tags (podcast_id, tag_id) VALUES (?, ?)");
  for (const p of dump.podcasts) {
    insertPodcast.run(
      pick(p, ["id", "slug", "title", "subtitle", "description", "summary", "cover_url", "audio_url",
        "duration_seconds", "producer", "category_id", "apple_url", "castbox_url", "transcript",
        "play_count", "published_at", "created_at", "episode_number", "updated_at"])
    );
    for (const t of p.tags ?? []) if (tags.has(t.id)) linkPodcastTag.run(p.id, t.id);
  }

  const insertArticle = db.prepare(`
    INSERT INTO articles (id, slug, title, excerpt, body, cover_url, author, category_id,
      view_count, published_at, created_at, read_time_minutes, updated_at)
    VALUES (@id, @slug, @title, @excerpt, @body, @cover_url, @author, @category_id,
      @view_count, @published_at, @created_at, @read_time_minutes, @updated_at)`);
  const linkArticleTag = db.prepare("INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)");
  for (const a of dump.articles) {
    insertArticle.run(
      pick(a, ["id", "slug", "title", "excerpt", "body", "cover_url", "author", "category_id",
        "view_count", "published_at", "created_at", "read_time_minutes", "updated_at"])
    );
    for (const t of a.tags ?? []) if (tags.has(t.id)) linkArticleTag.run(a.id, t.id);
  }

  const insertFaq = db.prepare("INSERT INTO faqs (id, question, answer, sort_order) VALUES (@id, @question, @answer, @sort_order)");
  for (const f of dump.faqs.data) insertFaq.run(pick(f, ["id", "question", "answer", "sort_order"]));

  // Upsert instead of delete: seed may hold copy keys the live dump never exposed.
  const upsertContent = db.prepare("INSERT INTO site_content (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP");
  for (const [key, value] of Object.entries(dump.content.data)) upsertContent.run(key, value);

  const insertMessage = db.prepare("INSERT INTO contact_messages (id, name, email, subject, message, created_at) VALUES (@id, @name, @email, @subject, @message, @created_at)");
  for (const m of dump.admin_messages?.data?.contact ?? []) {
    insertMessage.run(pick(m, ["id", "name", "email", "subject", "message", "created_at"]));
  }

  const insertSubscriber = db.prepare(`
    INSERT INTO newsletter_subscribers (id, email, subscribed_at, confirmed, confirmation_token, confirmed_at, unsubscribe_token)
    VALUES (@id, @email, @subscribed_at, @confirmed, @confirmation_token, @confirmed_at, @unsubscribe_token)`);
  for (const s of dump.admin_messages?.data?.subscribers ?? []) {
    insertSubscriber.run(pick(s, ["id", "email", "subscribed_at", "confirmed", "confirmation_token", "confirmed_at", "unsubscribe_token"]));
  }

  // Keep AUTOINCREMENT sequences at max(id) so admin-panel creates never collide with restored ids.
  for (const t of ["categories", "tags", "podcasts", "articles", "contact_messages", "newsletter_subscribers"]) {
    db.exec(`DELETE FROM sqlite_sequence WHERE name='${t}';
             INSERT INTO sqlite_sequence (name, seq) SELECT '${t}', COALESCE(MAX(id), 0) FROM ${t};`);
  }
});

importDump();

const count = (t: string) => (db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get() as { n: number }).n;
const expected: Record<string, number> = {
  categories: dump.categories.data.length,
  podcasts: dump.podcasts.length,
  articles: dump.articles.length,
  faqs: dump.faqs.data.length,
  contact_messages: dump.admin_messages?.data?.contact?.length ?? 0,
  newsletter_subscribers: dump.admin_messages?.data?.subscribers?.length ?? 0,
};
expected.tags = new Set<number>([...dump.podcasts, ...dump.articles].flatMap((i: any) => (i.tags ?? []).map((t: any) => t.id))).size;

for (const [table, want] of Object.entries(expected)) {
  const got = count(table);
  if (got !== want) throw new Error(`${table}: expected ${want} rows, found ${got}`);
}
console.log(JSON.stringify({ restored: true, from: dumpPath, ...expected }, null, 2));
