import { getSession } from "@/lib/auth";
import { ok } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = await getSession();
  return ok({ authenticated: !!s, username: s?.sub ?? null });
}
