import { clearSessionCookie, getSession, revokeSession } from "@/lib/auth";
import { ok } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getSession();
  if (session) {
    await revokeSession(session.uid);
  }
  await clearSessionCookie();
  return ok({ logged_out: true });
}
