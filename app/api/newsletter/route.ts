import { z } from "zod";
import { subscribeEmail, getUnsubscribeToken } from "@/lib/repos/newsletter";
import { ok, fail, tooMany } from "@/lib/http";
import { rateLimit, clientKey } from "@/lib/ratelimit";
import { sendConfirmationEmail, buildConfirmationUrl, buildUnsubscribeUrl } from "@/lib/email";

export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().email("به نظر می‌رسد آدرس ایمیل کامل نیست."),
});

export async function POST(req: Request) {
  const rl = rateLimit(clientKey(req, "newsletter"), { windowSeconds: 60, max: 5 });
  if (!rl.ok) return tooMany(rl.retry_after_seconds);

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail("یک بار دیگر امتحان کنیم؟", 400);
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "به نظر می‌رسد آدرس ایمیل کامل نیست.", 400);

  const email = parsed.data.email;
  const r = subscribeEmail(email);

  if (r.already_confirmed) {
    return ok({
      subscribed: true,
      already_subscribed: true,
      already_confirmed: true,
      message: "از همراهی تو خوشحالیم — این ایمیل پیش‌تر ثبت و تأیید شده.",
    });
  }

  // Send confirmation email (or log the URLs if SMTP isn't configured)
  if (r.token) {
    const confirmUrl = buildConfirmationUrl(r.token);
    const unsubToken = getUnsubscribeToken(email);
    await sendConfirmationEmail(email, confirmUrl, unsubToken ? buildUnsubscribeUrl(unsubToken) : undefined);
  }

  if (r.created) {
    return ok({
      subscribed: true,
      already_subscribed: false,
      message: "یک ایمیل تأیید برای شما ارسال شد. لطفاً روی لینک داخل ایمیل کلیک کنید تا عضویت شما نهایی شود.",
    });
  }

  // Re-subscribed (was pending, new token sent)
  return ok({
    subscribed: true,
    already_subscribed: true,
    already_confirmed: false,
    message: "یک ایمیل تأیید جدید برای شما ارسال شد. لطفاً روی لینک داخل ایمیل کلیک کنید.",
  });
}
