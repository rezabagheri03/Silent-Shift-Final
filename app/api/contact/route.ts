import { z } from "zod";
import { createContactMessage } from "@/lib/repos/contact";
import { ok, fail, tooMany } from "@/lib/http";
import { rateLimit, clientKey } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

const Body = z.object({
  name: z.string().min(2, "نام را وارد کنید").max(80),
  email: z.string().email("ایمیل نامعتبر است"),
  subject: z.string().max(120).optional().or(z.literal("")),
  message: z.string().min(5, "متن پیام خیلی کوتاه است").max(4000),
});

export async function POST(req: Request) {
  const rl = rateLimit(clientKey(req, "contact"), { windowSeconds: 600, max: 5 });
  if (!rl.ok) return tooMany(rl.retry_after_seconds);

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail("درخواست نامعتبر است", 400);
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "ورودی نامعتبر است", 400);

  const msg = createContactMessage({
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject || null,
    message: parsed.data.message,
  });
  return ok({
    id: msg.id,
    message: "پیامت رسید. با آرامش می‌خوانم و به‌زودی پاسخ می‌دهم.",
  });
}
