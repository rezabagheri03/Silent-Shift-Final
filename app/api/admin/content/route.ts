import { z } from "zod";
import { ok, fail } from "@/lib/http";
import { isAdmin } from "@/lib/auth";
import { getAllContent, setContent } from "@/lib/repos/content";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await isAdmin();
  if (!session) return fail("Unauthorized", 401);
  return ok(getAllContent());
}

const MAX_CONTENT_KEYS = 100;
const MAX_KEY_LENGTH = 64;
const MAX_VALUE_LENGTH = 50_000;
const KEY_PATTERN = /^[a-zA-Z0-9_-]+$/;

const Body = z
  .record(z.string().max(MAX_KEY_LENGTH).regex(KEY_PATTERN, "کلید فقط می‌تواند شامل حروف، اعداد، خط تیره و زیرخط باشد"), z.string().max(MAX_VALUE_LENGTH))
  .refine(
    (obj) => Object.keys(obj).length <= MAX_CONTENT_KEYS,
    { message: `حداکثر ${MAX_CONTENT_KEYS} کلید مجاز است` }
  );

async function upsertContent(req: Request) {
  const session = await isAdmin();
  if (!session) return fail("Unauthorized", 401);

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail("درخواست نامعتبر است", 400);
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) return fail("ورودی نامعتبر است", 400);
  for (const [k, v] of Object.entries(parsed.data)) setContent(k, v);
  return ok(getAllContent());
}

// Accept both PUT and PATCH for consistency with other admin endpoints
export { upsertContent as PUT, upsertContent as PATCH };
