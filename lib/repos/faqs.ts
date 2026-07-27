import { db, safeColumnNames } from "@/lib/db";
import type { Faq } from "@/lib/types";

const FAQ_COLUMNS = ["question", "answer", "sort_order"] as const;

export function listFaqs(): Faq[] {
  return db
    .prepare("SELECT * FROM faqs ORDER BY sort_order ASC, id ASC")
    .all() as Faq[];
}

export function getFaq(id: number): Faq | null {
  return (db.prepare("SELECT * FROM faqs WHERE id = ?").get(id) as Faq | undefined) ?? null;
}

export function createFaq(input: { question: string; answer: string; sort_order?: number }): Faq {
  const info = db
    .prepare("INSERT INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)")
    .run(input.question.trim(), input.answer.trim(), input.sort_order ?? 999);
  return db.prepare("SELECT * FROM faqs WHERE id = ?").get(info.lastInsertRowid) as Faq;
}

export function updateFaq(
  id: number,
  patch: Partial<{ question: string; answer: string; sort_order: number }>
): boolean {
  const rawKeys = Object.keys(patch);
  if (rawKeys.length === 0) return false;
  const keys = safeColumnNames(rawKeys, FAQ_COLUMNS);
  const setSql = keys.map((k) => `${k} = @${k}`).join(", ");
  const info = db.prepare(`UPDATE faqs SET ${setSql} WHERE id = @id`).run({ ...patch, id });
  return info.changes > 0;
}

export function deleteFaq(id: number): boolean {
  return db.prepare("DELETE FROM faqs WHERE id = ?").run(id).changes > 0;
}
