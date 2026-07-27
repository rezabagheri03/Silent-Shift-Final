import { z } from "zod";
import { ok, fail } from "@/lib/http";
import { isAdmin } from "@/lib/auth";
import { createTag, listTags } from "@/lib/repos/tags";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

const Body = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
});

export async function GET() {
  const session = await isAdmin();
  if (!session) return fail("Unauthorized", 401);
  return ok(listTags());
}

export async function POST(req: Request) {
  const session = await isAdmin();
  if (!session) return fail("Unauthorized", 401);
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail("درخواست نامعتبر است", 400);
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "ورودی نامعتبر است", 400);
  const slug = parsed.data.slug?.trim() ? slugify(parsed.data.slug) : slugify(parsed.data.name);
  try {
    const created = createTag({ slug, name: parsed.data.name.trim() });
    return ok(created, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "";
    if (message.includes("UNIQUE")) return fail("این تگ قبلاً ثبت شده است", 409);
    console.error("[tags:create]", e);
    return fail("خطا در ایجاد تگ", 500);
  }
}
