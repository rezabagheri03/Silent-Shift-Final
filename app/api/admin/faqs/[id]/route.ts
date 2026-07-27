import { z } from "zod";
import { ok, fail } from "@/lib/http";
import { isAdmin } from "@/lib/auth";
import { deleteFaq, getFaq, updateFaq } from "@/lib/repos/faqs";

export const dynamic = "force-dynamic";

const Patch = z.object({
  question: z.string().min(2).optional(),
  answer: z.string().min(2).optional(),
  sort_order: z.number().int().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await isAdmin();
  if (!session) return fail("Unauthorized", 401);
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return fail("شناسه نامعتبر است", 400);
  if (!getFaq(id)) return fail("پیدا نشد", 404);
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail("درخواست نامعتبر است", 400);
  }
  const parsed = Patch.safeParse(json);
  if (!parsed.success) return fail("ورودی نامعتبر است", 400);
  updateFaq(id, parsed.data);
  return ok({ updated: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await isAdmin();
  if (!session) return fail("Unauthorized", 401);
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return fail("شناسه نامعتبر است", 400);
  const okDel = deleteFaq(id);
  if (!okDel) return fail("پیدا نشد", 404);
  return ok({ deleted: true });
}
