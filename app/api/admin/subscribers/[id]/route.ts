import { ok, fail } from "@/lib/http";
import { isAdmin } from "@/lib/auth";
import { deleteSubscriber } from "@/lib/repos/newsletter";

export const dynamic = "force-dynamic";

/** DELETE /api/admin/subscribers/:id — erase a newsletter subscriber (audit T14). */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await isAdmin();
  if (!session) return fail("Unauthorized", 401);
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) return fail("شناسه نامعتبر است", 400);
  if (!deleteSubscriber(id)) return fail("مشترک پیدا نشد", 404);
  return ok({ deleted: true, id });
}
