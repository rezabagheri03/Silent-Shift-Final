/**
 * Lightweight email sender for newsletter confirmation.
 *
 * In production, configure SMTP via environment variables to enable real email delivery.
 * Without SMTP configured, confirmation URLs are logged to the console so the
 * feature still works — admins can copy the URL and send it manually.
 */

export function buildConfirmationUrl(token: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${base}/api/newsletter/confirm/${token}`;
}

export function buildUnsubscribeUrl(token: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${base}/api/newsletter/unsubscribe/${token}`;
}

/**
 * Send a confirmation email to a new newsletter subscriber.
 *
 * If SMTP is configured (SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM),
 * this sends a real email. Otherwise, it logs the confirmation URL
 * to the console so it can be copied and sent manually.
 *
 * Returns true if the email was sent (or logged), false on failure.
 */
export async function sendConfirmationEmail(
  email: string,
  confirmationUrl: string,
  unsubscribeUrl?: string
): Promise<boolean> {
  const smtpHost = process.env.SMTP_HOST;

  if (smtpHost) {
    // Real SMTP delivery
    try {
      let nodemailer: any;
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        nodemailer = require("nodemailer");
      } catch {
        console.warn("[email] nodemailer not installed — falling back to console log");
        return logConfirmationEmail(email, confirmationUrl, unsubscribeUrl);
      }

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: process.env.SMTP_USER
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS || "",
            }
          : undefined,
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"Silent Shift" <noreply@silentshift.io>`,
        to: email,
        subject: "تأیید عضویت در خبرنامه Silent Shift",
        html: confirmationHtml(confirmationUrl),
      });

      console.log(`[email] confirmation sent to ${email}`);
      return true;
    } catch (error) {
      console.error("[email] failed to send confirmation:", error);
      return false;
    }
  }

  // No SMTP configured — log the URLs for manual delivery
  return logConfirmationEmail(email, confirmationUrl, unsubscribeUrl);
}

function logConfirmationEmail(email: string, url: string, unsubscribeUrl?: string): boolean {
  console.log(
    `[newsletter] Confirmation for ${email}:\n  confirm:     ${url}\n  unsubscribe: ${unsubscribeUrl || "(n/a)"}\n  (Include BOTH links in the manually-sent email)`
  );
  return true;
}

function confirmationHtml(url: string): string {
  return `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Tahoma,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#171717;border-radius:12px;overflow:hidden;">
    <tr>
      <td style="padding:40px 32px;text-align:center;">
        <h1 style="color:#D4AF37;font-size:24px;margin:0 0 16px;">Silent Shift</h1>
        <p style="color:#ffffff;font-size:16px;line-height:1.7;margin:0 0 24px;">
          سلام! برای تأیید عضویت شما در خبرنامه Silent Shift، لطفاً روی دکمه زیر کلیک کنید.
        </p>
        <a href="${url}"
           style="display:inline-block;background:#D4AF37;color:#000000;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:16px;font-weight:600;">
          تأیید عضویت
        </a>
        <p style="color:#52525B;font-size:13px;line-height:1.6;margin:24px 0 0;">
          اگر شما این درخواست را ثبت نکرده‌اید، این ایمیل را نادیده بگیرید.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
