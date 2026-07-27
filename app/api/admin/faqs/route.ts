import { z } from "zod";
import { ok, fail } from "@/lib/http";
import { isAdmin } from "@/lib/auth";
import { createFaq, listFaqs } from "@/lib/repos/faqs";

export const dynamic = "force-dynamic";

const Body = z.object({
  question: z.string().min(2),
  answer: z.string().min(2),
  sort_order: z.number().int().optional(),
});

export async function GET() {
  const session = await isAdmin();
  if (!session) return fail("Unauthorized", 401);
  return ok(listFaqs());
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
  const created = createFaq(parsed.data);
  return ok(created, { status: 201 });
}
