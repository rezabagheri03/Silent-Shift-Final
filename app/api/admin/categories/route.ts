import { z } from "zod";
import { ok, fail } from "@/lib/http";
import { isAdmin } from "@/lib/auth";
import { createCategory, listCategories } from "@/lib/repos/categories";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

const Body = z.object({
  name: z.string().min(1, "نام الزامی است"),
  slug: z.string().optional(),
});

export async function GET() {
  const session = await isAdmin();
  if (!session) return fail("Unauthorized", 401);
  return ok(listCategories());
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
    const created = createCategory({ slug, name: parsed.data.name.trim() });
    return ok(created, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("UNIQUE")) return fail("این دسته قبلاً ثبت شده است", 409);
    console.error("[categories:create]", e);
    return fail("خطا در ایجاد دسته", 500);
  }
}
