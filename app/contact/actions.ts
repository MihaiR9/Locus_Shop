"use server";

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

/**
 * Stub server action — logs the message and reports success.
 * TODO (Faza 2): wire Resend transactional email + persist row in
 * Supabase contact_messages table for back-office triage.
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

  console.log("[contact-form]", {
    receivedAt: new Date().toISOString(),
    name,
    email,
    phone: phone || null,
    reason,
    message,
  });

  return { ok: true };
}
