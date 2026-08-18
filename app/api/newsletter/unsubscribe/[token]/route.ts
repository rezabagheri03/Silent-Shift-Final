import { unsubscribeByToken } from "@/lib/repos/newsletter";
import { rateLimit, clientKey } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

/**
 * GET /api/newsletter/unsubscribe/:token
 *
 * Erases the subscriber (GDPR-style deletion) and shows an HTML result page,
 * so the link works directly from an email client. (Audit T14 / BE M-5)
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const rl = rateLimit(clientKey(req, "unsubscribe"), { windowSeconds: 60, max: 10 });
  if (!rl.ok) return htmlPage("کمی صبر کنید", "تعداد درخواست‌ها زیاد است؛ لطفاً یک دقیقه دیگر دوباره تلاش کنید.", false, 429);

  const { token } = await params;
  if (!token || token.length < 16) {
    return htmlPage("لینک نامعتبر", "این لینک لغو عضویت معتبر نیست.", false, 400);
  }

  const result = unsubscribeByToken(token);
  if (result.success) {
    return htmlPage(
      "لغو عضویت انجام شد",
      "ایمیل شما از خبرنامه Silent Shift حذف شد و دیگر نامه‌ای دریافت نخواهید کرد. هر زمان خواستید، دوباره خوش آمدید.",
      true
    );
  }
  return htmlPage(
    "لینک نامعتبر یا استفاده‌شده",
    "این لینک معتبر نیست یا عضویت پیش‌تر لغو شده است.",
    false,
    404
  );
}

function htmlPage(title: string, message: string, success: boolean, status = 200) {
  const color = success ? "#D4AF37" : "#ef4444";
  const icon = success ? "✓" : "✗";
  const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>${title} | Silent Shift</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0a0a0a; color: #fff; font-family: Tahoma, Arial, sans-serif;
      min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { background: #171717; border: 1px solid #262626; border-radius: 16px;
      padding: 40px 32px; max-width: 460px; width: 100%; text-align: center; }
    .icon { width: 56px; height: 56px; border-radius: 50%; border: 2px solid ${color};
      color: ${color}; font-size: 28px; line-height: 52px; margin: 0 auto 20px; }
    h1 { font-size: 20px; margin-bottom: 12px; color: ${color}; }
    p { font-size: 15px; line-height: 1.9; color: #a1a1aa; }
    a { display: inline-block; margin-top: 24px; background: #D4AF37; color: #000;
      padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/">بازگشت به سایت</a>
  </div>
</body>
</html>`;
  return new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}
