import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, "app.db");

/**
 * Validate that every key in `keys` belongs to the `allowed` whitelist.
 * Returns the validated keys (narrowed to `string[]` — never user-controlled SQL).
 * Throws if any key is not in the whitelist.
 */
export function safeColumnNames(
  keys: string[],
  allowed: readonly string[]
): string[] {
  const set = new Set(allowed);
  for (const k of keys) {
    if (!set.has(k)) {
      throw new Error(`Invalid column name: ${k}`);
    }
    // Extra safety: column names must be simple identifiers (letters, digits, underscores)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k)) {
      throw new Error(`Unsafe column name rejected: ${k}`);
    }
  }
  return keys;
}

/**
 * Lightweight migration runner. Each migration runs once and is recorded
 * in the `_migrations` table so adding new ones is safe.
 *
 * IMPORTANT: this array must be declared BEFORE createDb() runs, because
 * the singleton `db` export below triggers `migrate()` at module load.
 */
const MIGRATIONS: { id: string; sql: string }[] = [
  {
    id: "001_initial_schema",
    sql: `
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS podcasts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        subtitle TEXT,
        description TEXT,
        summary TEXT,
        cover_url TEXT,
        audio_url TEXT,
        duration_seconds INTEGER DEFAULT 0,
        producer TEXT,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        apple_url TEXT,
        castbox_url TEXT,
        transcript TEXT,
        play_count INTEGER NOT NULL DEFAULT 0,
        published_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        excerpt TEXT,
        body TEXT NOT NULL,
        cover_url TEXT,
        author TEXT,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        view_count INTEGER NOT NULL DEFAULT 0,
        published_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        subscribed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS faqs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_podcasts_published_at ON podcasts(published_at DESC);
      CREATE INDEX IF NOT EXISTS idx_podcasts_play_count ON podcasts(play_count DESC);
      CREATE INDEX IF NOT EXISTS idx_podcasts_category ON podcasts(category_id);
      CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
      CREATE INDEX IF NOT EXISTS idx_articles_view_count ON articles(view_count DESC);
      CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
    `,
  },
  {
    id: "002_admin_contact_about_ratelimit",
    sql: `
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS site_content (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS rate_limits (
        key TEXT NOT NULL,
        bucket_start INTEGER NOT NULL,
        count INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (key, bucket_start)
      );

      CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_messages(created_at DESC);
    `,
  },
  {
    id: "003_tags",
    sql: `
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS podcast_tags (
        podcast_id INTEGER NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
        tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (podcast_id, tag_id)
      );

      CREATE TABLE IF NOT EXISTS article_tags (
        article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
        tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (article_id, tag_id)
      );

      CREATE INDEX IF NOT EXISTS idx_podcast_tags_tag ON podcast_tags(tag_id);
      CREATE INDEX IF NOT EXISTS idx_article_tags_tag ON article_tags(tag_id);
    `,
  },
  {
    id: "004_chapters",
    sql: `
      CREATE TABLE IF NOT EXISTS chapters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        podcast_id INTEGER NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        start_seconds INTEGER NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_chapters_podcast ON chapters(podcast_id, sort_order);
    `,
  },
  {
    id: "005_article_read_time",
    sql: `
      ALTER TABLE articles ADD COLUMN read_time_minutes INTEGER;
    `,
  },
  {
    id: "006_podcast_episode_number",
    sql: `
      ALTER TABLE podcasts ADD COLUMN episode_number INTEGER;
      UPDATE podcasts SET episode_number = id WHERE episode_number IS NULL;
      CREATE INDEX IF NOT EXISTS idx_podcasts_episode_number ON podcasts(episode_number);
    `,
  },
  {
    id: "007_session_revocations",
    sql: `
      CREATE TABLE IF NOT EXISTS session_revocations (
        admin_id INTEGER PRIMARY KEY REFERENCES admins(id) ON DELETE CASCADE,
        revoked_before TEXT NOT NULL
      );
    `,
  },
  {
    id: "008_newsletter_confirmation",
    sql: `
      ALTER TABLE newsletter_subscribers ADD COLUMN confirmed INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE newsletter_subscribers ADD COLUMN confirmation_token TEXT;
      ALTER TABLE newsletter_subscribers ADD COLUMN confirmed_at TEXT;
    `,
  },
  {
    id: "009_newsletter_unsubscribe",
    sql: `
      ALTER TABLE newsletter_subscribers ADD COLUMN unsubscribe_token TEXT;
      UPDATE newsletter_subscribers SET unsubscribe_token = lower(hex(randomblob(24))) WHERE unsubscribe_token IS NULL;
      CREATE INDEX IF NOT EXISTS idx_subscribers_confirmation_token ON newsletter_subscribers(confirmation_token);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_unsubscribe_token ON newsletter_subscribers(unsubscribe_token);
    `,
  },
];

function migrate(d: Database.Database) {
  d.exec(
    `CREATE TABLE IF NOT EXISTS _migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);`
  );
  const has = d.prepare("SELECT 1 FROM _migrations WHERE id = ?");
  // INSERT OR IGNORE: safe under concurrent imports (Next builds pages in parallel,
  // each loading db.ts → triggering migrate). The UNIQUE PK ensures only one wins.
  const mark = d.prepare("INSERT OR IGNORE INTO _migrations (id) VALUES (?)");
  for (const m of MIGRATIONS) {
    if (!has.get(m.id)) {
      const tx = d.transaction(() => {
        d.exec(m.sql);
        mark.run(m.id);
      });
      try {
        tx();
      } catch (e: any) {
        // If a concurrent process already applied this migration, swallow and continue.
        if (e?.code !== "SQLITE_CONSTRAINT_PRIMARYKEY") throw e;
      }
    }
  }
}

function createDb() {
  const d = new Database(DB_PATH);
  d.pragma("journal_mode = WAL");
  d.pragma("foreign_keys = ON");
  d.pragma("busy_timeout = 5000"); // Wait up to 5s for lock instead of failing immediately
  migrate(d);
  return d;
}

declare global {
  // eslint-disable-next-line no-var
  var __db: Database.Database | undefined;
}

export const db: Database.Database = global.__db ?? createDb();
if (process.env.NODE_ENV !== "production") global.__db = db;
