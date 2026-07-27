import { incrementPlayCount } from "@/lib/repos/podcasts";
import { ok, fail, tooMany } from "@/lib/http";
import { rateLimit, clientKey } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const rl = rateLimit(clientKey(req, `play:${(await params).slug}`), { windowSeconds: 60, max: 10 });
  if (!rl.ok) return tooMany(rl.retry_after_seconds);

  const count = incrementPlayCount((await params).slug);
  if (count === 0) return fail("پادکست پیدا نشد", 404);
  return ok({ play_count: count });
}
