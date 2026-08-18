import { db } from "@/lib/db";
import crypto from "node:crypto";

export type Subscriber = {
  id: number;
  email: string;
  subscribed_at: string;
  confirmed: number;
  confirmation_token: string | null;
  confirmed_at: string | null;
  unsubscribe_token: string | null;
};

/**
 * Subscribe an email to the newsletter.
 * If already subscribed and confirmed, returns { created: false, already_confirmed: true }.
 * If already subscribed but NOT confirmed, re-sends a new token and returns { created: false, already_confirmed: false }.
 * If new, creates the subscriber with an unconfirmed status and returns the token.
 */
export function subscribeEmail(email: string): {
  created: boolean;
  already_confirmed: boolean;
  token: string | null;
} {
  const normalized = email.trim().toLowerCase();

  return db.transaction(() => {
  const existing = db
    .prepare("SELECT id, confirmed FROM newsletter_subscribers WHERE email = ?")
    .get(normalized) as { id: number; confirmed: number } | undefined;

  if (existing) {
    if (existing.confirmed) {
      return { created: false, already_confirmed: true, token: null };
    }
    // Already subscribed but not confirmed — generate a new token
    const token = crypto.randomBytes(32).toString("hex");
    db.prepare(
      "UPDATE newsletter_subscribers SET confirmation_token = ? WHERE id = ?"
    ).run(token, existing.id);
    return { created: false, already_confirmed: false, token };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const unsubToken = crypto.randomBytes(24).toString("hex");
  db.prepare(
    "INSERT INTO newsletter_subscribers (email, confirmation_token, unsubscribe_token) VALUES (?, ?, ?)"
  ).run(normalized, token, unsubToken);

  return { created: true, already_confirmed: false, token };
  })();
}

/**
 * Unsubscribe (erase) a subscriber by their unsubscribe token.
 * GDPR-style erasure: the row is deleted entirely (audit T14 / BE M-5).
 */
export function unsubscribeByToken(token: string): { success: boolean; email: string | null } {
  const row = db
    .prepare("DELETE FROM newsletter_subscribers WHERE unsubscribe_token = ? RETURNING email")
    .get(token) as { email: string } | undefined;
  return row ? { success: true, email: row.email } : { success: false, email: null };
}

/** Admin-side erasure of a subscriber by id. */
export function deleteSubscriber(id: number): boolean {
  return db.prepare("DELETE FROM newsletter_subscribers WHERE id = ?").run(id).changes > 0;
}

/** Fetch a subscriber's unsubscribe token (used to build manual-email links). */
export function getUnsubscribeToken(email: string): string | null {
  const row = db
    .prepare("SELECT unsubscribe_token FROM newsletter_subscribers WHERE email = ?")
    .get(email.trim().toLowerCase()) as { unsubscribe_token: string | null } | undefined;
  return row?.unsubscribe_token ?? null;
}

/**
 * Confirm a subscriber by their token.
 * Returns true if successful, false if token is invalid or already confirmed.
 */
export function confirmEmail(token: string): { success: boolean; email: string | null } {
  const row = db
    .prepare(
      "SELECT id, email, confirmed FROM newsletter_subscribers WHERE confirmation_token = ?"
    )
    .get(token) as { id: number; email: string; confirmed: number } | undefined;

  if (!row) return { success: false, email: null };
  if (row.confirmed) return { success: false, email: row.email };

  db.prepare(
    "UPDATE newsletter_subscribers SET confirmed = 1, confirmed_at = CURRENT_TIMESTAMP, confirmation_token = NULL WHERE id = ?"
  ).run(row.id);

  return { success: true, email: row.email };
}

export function listSubscribers(limit = 500): Subscriber[] {
  return db
    .prepare("SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC LIMIT ?")
    .all(limit) as Subscriber[];
}
