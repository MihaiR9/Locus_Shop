"use server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendNewsletterWelcome } from "@/lib/email/send";

export type NewsletterResult = { ok: true } | { ok: false; error: string };

/** Cuponul oferit la abonare. Trebuie să existe activ în `coupons`. */
const WELCOME_COUPON_CODE = "LOCUS10";

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

  /* Pop-up-ul promite „−10% la prima comandă", deci emailul trebuie să
     ducă un cod care chiar trece la checkout. Îl citim din DB în loc să-l
     scriem în cod: dacă e dezactivat sau expirat, emailul pleacă fără
     promisiune, nu cu una pe care coșul o refuză. */
  const couponCode = await getWelcomeCouponCode(supabase);

  // Best-effort welcome — don't fail the action if Resend is down.
  await sendNewsletterWelcome(email, couponCode);

  return { ok: true };
}

/** Codul de bun-venit, dacă mai e valid. `undefined` = nu promitem nimic. */
async function getWelcomeCouponCode(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
): Promise<string | undefined> {
  const { data, error } = await supabase
    .from("coupons")
    .select("code, expires_at, max_uses, used_count")
    .eq("code", WELCOME_COUPON_CODE)
    .eq("active", true)
    .maybeSingle();

  if (error || !data) return undefined;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return undefined;
  if (data.max_uses !== null && data.used_count >= data.max_uses) return undefined;
  return data.code;
}
