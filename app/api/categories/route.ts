import { listCategories } from "@/lib/repos/categories";
import { ok, tooMany } from "@/lib/http";
import { rateLimit, clientKey } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const rl = rateLimit(clientKey(req, "pub:categories"), { windowSeconds: 60, max: 60 });
  if (!rl.ok) return tooMany(rl.retry_after_seconds);
  return ok(listCategories());
}
