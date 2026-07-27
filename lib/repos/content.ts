import { db } from "@/lib/db";

export function getContent(key: string): string | null {
  const row = db.prepare("SELECT value FROM site_content WHERE key = ?").get(key) as
    | { value: string }
    | undefined;
  return row?.value ?? null;
}

export function setContent(key: string, value: string): void {
  db.prepare(
    `INSERT INTO site_content (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
  ).run(key, value);
}

export function getAllContent(): Record<string, string> {
  const rows = db.prepare("SELECT key, value FROM site_content").all() as {
    key: string;
    value: string;
  }[];
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}
