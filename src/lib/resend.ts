import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendSupportNotification({
  agentName,
  agentEmail,
  subject,
  message,
  messageId,
}: {
  agentName: string;
  agentEmail: string;
  subject: string;
  message: string;
  messageId: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL ?? "kayrozsex@gmail.com";

  await resend.emails.send({
    from: "VisitFlow Support <support@visitflow.fr>",
    to: adminEmail,
    subject: `[Support] ${subject}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <div style="background:#1e293b;border-radius:12px;padding:24px;color:#f1f5f9">
          <h2 style="margin:0 0 4px;font-size:18px;color:#fff">Nouveau message de support</h2>
          <p style="margin:0 0 24px;font-size:13px;color:#94a3b8">VisitFlow — Backoffice</p>

          <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
            <tr>
              <td style="padding:8px 0;font-size:13px;color:#94a3b8;width:100px">Client</td>
              <td style="padding:8px 0;font-size:14px;color:#f1f5f9;font-weight:600">${agentName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:13px;color:#94a3b8">Email</td>
              <td style="padding:8px 0;font-size:14px;color:#60a5fa">${agentEmail}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:13px;color:#94a3b8">Sujet</td>
              <td style="padding:8px 0;font-size:14px;color:#f1f5f9">${subject}</td>
            </tr>
          </table>

          <div style="background:#0f172a;border-radius:8px;padding:16px;margin-bottom:24px">
            <p style="margin:0;font-size:14px;color:#e2e8f0;line-height:1.6;white-space:pre-wrap">${message}</p>
          </div>

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/backoffice?tab=support&id=${messageId}"
             style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600">
            Voir dans le backoffice →
          </a>
        </div>
      </div>
    `,
  });
}
