import { z } from "zod";
import { ok, fail, tooMany } from "@/lib/http";
import { verifyAdminCredentials, signSession, setSessionCookie } from "@/lib/auth";
import { rateLimit, clientKey } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

const Body = z.object({
  username: z.string().min(1, "نام کاربری الزامی است"),
  password: z.string().min(1, "رمز عبور الزامی است"),
});

export async function POST(req: Request) {
  const rl = rateLimit(clientKey(req, "login"), { windowSeconds: 60, max: 5 });
  if (!rl.ok) return tooMany(rl.retry_after_seconds);

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail("درخواست نامعتبر است", 400);
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "ورودی نامعتبر است", 400);

  const user = await verifyAdminCredentials(parsed.data.username, parsed.data.password);
  if (!user) return fail("نام کاربری یا رمز عبور اشتباه است", 401);

  const token = await signSession({ sub: user.username, uid: user.uid });
  await setSessionCookie(token);
  return ok({ username: user.username });
}
