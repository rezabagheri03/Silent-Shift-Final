import { NextResponse } from "next/server";
import { confirmEmail } from "@/lib/repos/newsletter";

export const dynamic = "force-dynamic";

/**
 * GET /api/newsletter/confirm/:token
 *
 * Confirms a newsletter subscription. Returns an HTML page with the result
 * so users can click the link directly from their email client.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token || token.length < 16) {
    return htmlPage("لینک نامعتبر", "این لینک تأیید معتبر نیست.", false);
  }

  const result = confirmEmail(token);

  if (result.success) {
    return htmlPage(
      "عضویت تأیید شد ✓",
      "خوش آمدی! عضویت شما در خبرنامه Silent Shift با موفقیت تأیید شد. اولین نامه به زودی می‌رسد.",
      true
    );
  }

  if (result.email) {
    return htmlPage(
      "قبلاً تأیید شده",
      "این ایمیل پیش‌تر تأیید شده است. از همراهی شما سپاسگزاریم.",
      true
    );
  }

  return htmlPage(
    "لینک نامعتبر یا منقضی",
    "این لینک تأیید معتبر نیست یا منقضی شده است. لطفاً دوباره در سایت ثبت‌نام کنید.",
    false
  );
}

function htmlPage(title: string, message: string, success: boolean) {
  const color = success ? "#D4AF37" : "#ef4444";
  const icon = success ? "✓" : "✗";

  const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} | Silent Shift</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0a0a0a;
      color: #ffffff;
      font-family: Tahoma, Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: #171717;
      border: 1px solid #262626;
      border-radius: 12px;
      padding: 48px 32px;
      max-width: 480px;
      width: 100%;
      text-align: center;
    }
    .icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: ${color}15;
      border: 2px solid ${color};
      color: ${color};
      font-size: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }
    h1 {
      color: ${color};
      font-size: 24px;
      margin-bottom: 12px;
    }
    p {
      color: #a1a1aa;
      font-size: 16px;
      line-height: 1.8;
    }
    a {
      display: inline-block;
      margin-top: 24px;
      color: #D4AF37;
      text-decoration: underline;
      font-size: 14px;
    }
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

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
