import { db, safeColumnNames } from "@/lib/db";
import type { Category } from "@/lib/types";

const CATEGORY_COLUMNS = ["slug", "name"] as const;

export function listCategories(): Category[] {
  return db.prepare("SELECT * FROM categories ORDER BY name ASC").all() as Category[];
}

export function getCategoryBySlug(slug: string): Category | null {
  return (
    (db.prepare("SELECT * FROM categories WHERE slug = ?").get(slug) as Category | undefined) ??
    null
  );
}

export function getCategory(id: number): Category | null {
  return (db.prepare("SELECT * FROM categories WHERE id = ?").get(id) as Category | undefined) ?? null;
}

export function createCategory(input: { slug: string; name: string }): Category {
  const info = db
    .prepare("INSERT INTO categories (slug, name) VALUES (?, ?)")
    .run(input.slug, input.name);
  return db.prepare("SELECT * FROM categories WHERE id = ?").get(info.lastInsertRowid) as Category;
}

export function updateCategory(
  id: number,
  patch: Partial<{ slug: string; name: string }>
): boolean {
  const rawKeys = Object.keys(patch);
  if (rawKeys.length === 0) return false;
  const keys = safeColumnNames(rawKeys, CATEGORY_COLUMNS);
  const setSql = keys.map((k) => `${k} = @${k}`).join(", ");
  const info = db.prepare(`UPDATE categories SET ${setSql} WHERE id = @id`).run({ ...patch, id });
  return info.changes > 0;
}

export function deleteCategory(id: number): boolean {
  return db.prepare("DELETE FROM categories WHERE id = ?").run(id).changes > 0;
}
