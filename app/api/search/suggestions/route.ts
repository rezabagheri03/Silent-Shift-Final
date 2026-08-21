import { NextRequest } from "next/server";
import { listPodcasts } from "@/lib/repos/podcasts";
import { listArticles } from "@/lib/repos/articles";
import { ok, tooMany } from "@/lib/http";
import { rateLimit, clientKey } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

/**
 * Empty-state suggestions for the search popover.
 *
 * Returns a small mix of popular podcasts and articles so the popover
 * never looks empty when the user first opens it.
 */
export async function GET(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "pub:search:suggestions"), { windowSeconds: 60, max: 60 });
  if (!rl.ok) return tooMany(rl.retry_after_seconds);

  const podcasts = listPodcasts({ sort: "popular", limit: 4, page: 1 }).items;
  const articles = listArticles({ sort: "popular", limit: 4, page: 1 }).items;
  return ok({ podcasts, articles });
}