import { NextRequest } from "next/server";
import { listPodcasts } from "@/lib/repos/podcasts";
import { listArticles } from "@/lib/repos/articles";
import { ok, tooMany } from "@/lib/http";
import { rateLimit, clientKey } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "pub:search"), { windowSeconds: 60, max: 30 });
  if (!rl.ok) return tooMany(rl.retry_after_seconds);

  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (!q.trim()) return ok({ podcasts: [], articles: [], query: q });

  const podcasts = listPodcasts({ q, limit: 10, page: 1 }).items;
  const articles = listArticles({ q, limit: 10, page: 1 }).items;
  return ok({ podcasts, articles, query: q });
}
