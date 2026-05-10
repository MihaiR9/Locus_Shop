"use server";

import {
  getResend,
  fromAddress,
  adminEmail,
  recipientFor,
} from "@/lib/resend/server";

export type ContactReason =
  | "comanda"
  | "horeca"
  | "presa"
  | "altceva";

export type ContactState = {
  ok: boolean;
  error?: string;
};

const REASON_VALUES: ContactReason[] = ["comanda", "horeca", "presa", "altceva"];

const REASON_LABEL: Record<ContactReason, string> = {
  comanda: "Comandă",
  horeca: "Parteneriat HoReCa",
  presa: "Presă",
  altceva: "Altceva",
};

/**
 * Sends a contact-form message to the admin inbox via Resend, with
 * Reply-To set to the visitor's email so admin can reply directly.
 *
 * No DB persistence yet (the `contact_messages` table doesn't exist —
 * out of scope for now). The full audit trail lives in the Resend
 * dashboard's "Sent" log.
 */
export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !reason || !message) {
    return { ok: false, error: "Completează numele, email-ul, motivul și mesajul." };
  }
  if (!email.includes("@") || !email.includes(".")) {
    return { ok: false, error: "Adresa de email pare incorectă." };
  }
  if (!REASON_VALUES.includes(reason as ContactReason)) {
    return { ok: false, error: "Motiv invalid." };
  }
  if (message.length < 10) {
    return { ok: false, error: "Mesajul e prea scurt. Spune-ne ceva mai mult." };
  }

  const reasonLabel = REASON_LABEL[reason as ContactReason];

  // Plain-text-like HTML — Resend accepts both. Keep it readable in
  // any client.
  const html = `<!DOCTYPE html><html><body style="font-family:'IBM Plex Mono',Courier,monospace;color:#1A1A1A;background:#EBE1DA;padding:24px;">
    <h2 style="font-family:'Italiana',Georgia,serif;font-weight:400;font-size:28px;margin:0 0 16px;">Mesaj nou de la /contact</h2>
    <table cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;font-size:13px;line-height:1.7;">
      <tr><td style="color:#6E5E4B;text-transform:uppercase;letter-spacing:0.16em;font-size:10px;padding:6px 0;">De la</td><td style="text-align:right;padding:6px 0;">${escape(name)} &lt;${escape(email)}&gt;</td></tr>
      ${phone ? `<tr><td style="color:#6E5E4B;text-transform:uppercase;letter-spacing:0.16em;font-size:10px;padding:6px 0;">Telefon</td><td style="text-align:right;padding:6px 0;"><a href="tel:${escape(phone)}" style="color:#4A3C2D;">${escape(phone)}</a></td></tr>` : ""}
      <tr><td style="color:#6E5E4B;text-transform:uppercase;letter-spacing:0.16em;font-size:10px;padding:6px 0;">Motiv</td><td style="text-align:right;padding:6px 0;">${escape(reasonLabel)}</td></tr>
    </table>
    <div style="margin-top:24px;padding-top:24px;border-top:1px solid rgba(74,60,45,0.18);font-size:14px;line-height:1.85;color:#4A3C2D;white-space:pre-wrap;">${escape(message)}</div>
    <p style="margin-top:24px;font-size:11px;color:#6E5E4B;">
      Răspunzi direct la acest email — Reply-To e setat la ${escape(email)}.
    </p>
  </body></html>`;

  try {
    const result = await getResend().emails.send({
      from: fromAddress(),
      to: recipientFor(adminEmail()),
      replyTo: email,
      subject: `[contact · ${reasonLabel}] ${name}`,
      html,
    });
    if (result.error) {
      console.error("[contact] resend failed", result.error);
      return { ok: false, error: "Eroare la trimitere. Încearcă din nou sau scrie-ne pe email." };
    }
  } catch (err) {
    console.error("[contact] exception", err);
    return { ok: false, error: "Eroare la trimitere. Încearcă din nou sau scrie-ne pe email." };
  }

  return { ok: true };
}

function escape(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
