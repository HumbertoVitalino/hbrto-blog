import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export class EmailService {
    async sendWelcome(email: string): Promise<void> {
        const unsubscribeUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}`;

        await resend.emails.send({
            from: FROM,
            to: email,
            subject: "You're subscribed — humbertovitalino.com.br",
            html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 24px;">
    <tr>
      <td align="left" style="max-width:480px;margin:0 auto;display:block;">

        <p style="margin:0 0 32px;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#9ca3af;">
          humbertovitalino.com.br
        </p>

        <p style="margin:0 0 24px;font-size:16px;color:#111827;line-height:1.7;">
          Hey,
        </p>

        <p style="margin:0 0 24px;font-size:16px;color:#111827;line-height:1.7;">
          You're subscribed. I'll send you a note every time I post a new review — nothing else.
        </p>

        <p style="margin:0 0 48px;font-size:16px;color:#111827;line-height:1.7;">
          See you on the other side.<br />
          — Humberto
        </p>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 24px;" />

        <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
          You're receiving this because you subscribed at humbertovitalino.com.br.<br />
          <a href="${unsubscribeUrl}" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a>
        </p>

      </td>
    </tr>
  </table>
</body>
</html>
            `.trim()
        });
    }
}
