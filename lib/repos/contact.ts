import { db } from "@/lib/db";
import type { ContactMessage } from "@/lib/types";

export function createContactMessage(input: {
  name: string;
  email: string;
  subject?: string | null;
  message: string;
}): ContactMessage {
  const info = db
    .prepare(
      "INSERT INTO contact_messages (name, email, subject, message) VALUES (@name, @email, @subject, @message)"
    )
    .run({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      subject: input.subject?.trim() || null,
      message: input.message.trim(),
    });
  return db
    .prepare("SELECT * FROM contact_messages WHERE id = ?")
    .get(info.lastInsertRowid) as ContactMessage;
}

/** Admin-side erasure of a contact message (audit T14 / BE M-5). */
export function deleteContactMessage(id: number): boolean {
  return db.prepare("DELETE FROM contact_messages WHERE id = ?").run(id).changes > 0;
}

export function listContactMessages(limit = 100): ContactMessage[] {
  return db
    .prepare("SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT ?")
    .all(limit) as ContactMessage[];
}
