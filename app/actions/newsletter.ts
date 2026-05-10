"use server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendNewsletterWelcome } from "@/lib/email/send";

export type NewsletterResult = { ok: true } | { ok: false; error: string };

/**
 * Newsletter signup:
 *   1. Persist email in `newsletter_subs` (unique on email; re-sub idempotent)
 *   2. Send welcome email via Resend
 * If the email send fails, we still consider the signup successful —
 * the row is in DB so we can retry later. We never block UX on email.
 */
export async function subscribeNewsletter(
  prev: NewsletterResult,
  formData: FormData,
): Promise<NewsletterResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@") || !email.includes(".")) {
    return { ok: false, error: "Adresa de email pare incorectă." };
  }

  const supabase = getSupabaseAdminClient();
  const { error: dbErr } = await supabase
    .from("newsletter_subs")
    .upsert(
      { email, consent_at: new Date().toISOString(), unsubscribed_at: null },
      { onConflict: "email" },
    );

  if (dbErr) {
    console.error("[newsletter] DB insert failed", dbErr);
    return { ok: false, error: "Eroare la salvare. Încearcă din nou." };
  }

  // Best-effort welcome — don't fail the action if Resend is down.
  await sendNewsletterWelcome(email);

  return { ok: true };
}
