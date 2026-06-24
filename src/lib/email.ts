import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM || "Keel <onboarding@resend.dev>";
export const emailEnabled = !!process.env.RESEND_API_KEY;

// Sends an email. If RESEND_API_KEY is not set, logs to the server (dev mode)
// and returns ok:false so callers can surface the link directly instead.
export async function sendEmail(opts: { to: string; subject: string; html: string }) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[email:dev] (no RESEND_API_KEY) to=${opts.to} subject="${opts.subject}"`);
    return { ok: false as const };
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({ from: FROM, to: opts.to, subject: opts.subject, html: opts.html });
    if (error) { console.error("[email] resend error", error); return { ok: false as const }; }
    return { ok: true as const };
  } catch (e) {
    console.error("[email] send failed", e);
    return { ok: false as const };
  }
}

export function emailLayout(title: string, body: string, cta?: { label: string; url: string }) {
  return `<!doctype html><html><body style="margin:0;background:#f4f6fa;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px;">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:22px;">
      <div style="width:26px;height:26px;border-radius:7px;background:#0D0E24;"></div>
      <span style="font-weight:600;color:#0D0E24;font-size:17px;">Keel</span>
    </div>
    <div style="background:#ffffff;border:1px solid #DDE1E8;border-radius:14px;padding:28px;">
      <h1 style="margin:0 0 12px;font-size:19px;color:#0D0E24;">${title}</h1>
      <div style="font-size:14px;line-height:1.6;color:#4B5160;">${body}</div>
      ${cta ? `<a href="${cta.url}" style="display:inline-block;margin-top:20px;background:#4E2BD6;color:#ffffff;text-decoration:none;font-weight:500;font-size:14px;padding:11px 18px;border-radius:10px;">${cta.label}</a>` : ""}
    </div>
    <p style="font-size:12px;color:#9AA1B0;margin-top:18px;text-align:center;">The backbone of high-performing teams.</p>
  </div></body></html>`;
}
