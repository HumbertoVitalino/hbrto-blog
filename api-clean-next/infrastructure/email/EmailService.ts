import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Resend rejects batch requests with more than 100 emails
const BATCH_LIMIT = 100;

type BatchEmail = Parameters<typeof resend.batch.send>[0][number];

function escapeHtml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// The Resend SDK returns { data, error } instead of throwing, so failures must be checked explicitly
async function sendBatch(messages: BatchEmail[]): Promise<number> {
    let sent = 0;

    for (let i = 0; i < messages.length; i += BATCH_LIMIT) {
        const { error } = await resend.batch.send(messages.slice(i, i + BATCH_LIMIT));

        if (error) {
            throw new Error(`Resend batch failed after ${sent}/${messages.length} emails: ${error.message}`);
        }

        sent += Math.min(BATCH_LIMIT, messages.length - i);
    }

    return sent;
}

function baseHtml(content: string, unsubscribeUrl?: string) {
    const footer = unsubscribeUrl
        ? `<hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 24px;" />
           <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
             You're receiving this because you subscribed at humbertovitalino.com.br.<br />
             <a href="${unsubscribeUrl}" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a>
           </p>`
        : "";

    return `<!DOCTYPE html>
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
        ${content}
        ${footer}
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export class EmailService {
    async sendWelcome(email: string): Promise<void> {
        const unsubscribeUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}`;

        await resend.emails.send({
            from: FROM,
            to: email,
            subject: "You're subscribed — humbertovitalino.com.br",
            html: baseHtml(`
                <p style="margin:0 0 24px;font-size:16px;color:#111827;line-height:1.7;">Hey,</p>
                <p style="margin:0 0 24px;font-size:16px;color:#111827;line-height:1.7;">
                    You're subscribed. I'll write when I publish a new note on what I'm reading, playing or building. Nothing else.
                </p>
                <p style="margin:0 0 48px;font-size:16px;color:#111827;line-height:1.7;">
                    See you on the other side.<br />— Humberto
                </p>
            `, unsubscribeUrl)
        });
    }

    async sendNewNote(emails: string[], noteTitle: string, noteId: string): Promise<number> {
        if (emails.length === 0) return 0;

        const noteUrl = `${SITE_URL}/notes/${encodeURIComponent(noteId)}`;

        return await sendBatch(
            emails.map((email) => ({
                from: FROM,
                to: email,
                subject: `New note: ${noteTitle}`,
                html: baseHtml(`
                    <p style="margin:0 0 24px;font-size:16px;color:#111827;line-height:1.7;">Hey,</p>
                    <p style="margin:0 0 24px;font-size:16px;color:#111827;line-height:1.7;">
                        I just published a new note: <strong>${escapeHtml(noteTitle)}</strong>.
                    </p>
                    <p style="margin:0 0 48px;">
                        <a href="${noteUrl}" style="font-size:15px;color:#111827;font-weight:600;text-decoration:underline;">
                            Read it →
                        </a>
                    </p>
                    <p style="margin:0 0 48px;font-size:16px;color:#111827;line-height:1.7;">
                        — Humberto
                    </p>
                `, `${SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}`)
            }))
        );
    }

    async sendBroadcast(emails: string[], subject: string, message: string): Promise<number> {
        if (emails.length === 0) return 0;

        return await sendBatch(
            emails.map((email) => ({
                from: FROM,
                to: email,
                subject,
                html: baseHtml(`
                    <p style="margin:0 0 24px;font-size:16px;color:#111827;line-height:1.7;">Hey,</p>
                    <p style="margin:0 0 48px;font-size:16px;color:#111827;line-height:1.7;white-space:pre-line;">
                        ${message}
                    </p>
                    <p style="margin:0 0 48px;font-size:16px;color:#111827;line-height:1.7;">
                        — Humberto
                    </p>
                `, `${SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}`)
            }))
        );
    }
}
