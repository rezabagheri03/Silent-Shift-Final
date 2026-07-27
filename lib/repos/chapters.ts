import { db } from "@/lib/db";

export type Chapter = {
  id: number;
  podcast_id: number;
  title: string;
  start_seconds: number;
  sort_order: number;
};

export function listChapters(podcastId: number): Chapter[] {
  return db
    .prepare(
      "SELECT * FROM chapters WHERE podcast_id = ? ORDER BY start_seconds ASC, sort_order ASC"
    )
    .all(podcastId) as Chapter[];
}

/** Replace all chapters for a podcast in a single transaction. */
export function setChapters(
  podcastId: number,
  chapters: { title: string; start_seconds: number }[]
) {
  const tx = db.transaction(() => {
    db.prepare("DELETE FROM chapters WHERE podcast_id = ?").run(podcastId);
    const ins = db.prepare(
      "INSERT INTO chapters (podcast_id, title, start_seconds, sort_order) VALUES (?, ?, ?, ?)"
    );
    // sort by start_seconds then insert with sequential sort_order
    const sorted = [...chapters].sort((a, b) => a.start_seconds - b.start_seconds);
    sorted.forEach((c, i) => {
      const title = (c.title || "").trim();
      const start = Math.max(0, Math.floor(c.start_seconds));
      if (!title) return;
      ins.run(podcastId, title, start, i);
    });
  });
  tx();
}

export function bulkGetChaptersMap(podcastIds: number[]): Record<number, Chapter[]> {
  if (podcastIds.length === 0) return {};
  const ph = podcastIds.map(() => "?").join(",");
  const rows = db
    .prepare(
      `SELECT * FROM chapters WHERE podcast_id IN (${ph}) ORDER BY start_seconds ASC`
    )
    .all(...podcastIds) as Chapter[];
  const map: Record<number, Chapter[]> = {};
  for (const r of rows) (map[r.podcast_id] ||= []).push(r);
  return map;
}
