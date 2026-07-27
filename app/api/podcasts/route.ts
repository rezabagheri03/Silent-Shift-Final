import { NextRequest } from "next/server";
import { listPodcasts } from "@/lib/repos/podcasts";
import { ok, tooMany, parsePagination, parseSort } from "@/lib/http";
import { rateLimit, clientKey } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "pub:podcasts"), { windowSeconds: 60, max: 60 });
  if (!rl.ok) return tooMany(rl.retry_after_seconds);

  const { searchParams } = req.nextUrl;
  const { page, limit } = parsePagination(searchParams);
  const result = listPodcasts({
    category: searchParams.get("category") ?? undefined,
    tag: searchParams.get("tag") ?? undefined,
    sort: parseSort(searchParams.get("sort")),
    q: searchParams.get("q") ?? undefined,
    page,
    limit,
  });
  return ok(result);
}
