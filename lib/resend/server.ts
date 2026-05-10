import "server-only";
import { Resend } from "resend";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error(
      "RESEND_API_KEY missing. Add it to .env.local — see .env.local.example.",
    );
  }
  _resend = new Resend(key);
  return _resend;
}

/**
 * "From" address used on every outbound email. Until the domain is
 * verified in Resend (SPF + DKIM in DNS), this should be a sandbox
 * sender like "Domeniul Locus <onboarding@resend.dev>". Once verified,
 * switch to office@domeniul-locus.ro.
 */
export function fromAddress(): string {
  return process.env.RESEND_FROM_EMAIL || "Domeniul Locus <onboarding@resend.dev>";
}

/** Email-ul intern (admin) la care se trimit notificările de comenzi noi. */
export function adminEmail(): string {
  return process.env.RESEND_ADMIN_EMAIL || "office@domeniul-locus.ro";
}

/**
 * In Resend's onboarding/sandbox mode (no verified domain), the API
 * refuses to send to anyone EXCEPT the email registered on the
 * Resend account. So we redirect "to" to the dev address while the
 * domain is still unverified. Set RESEND_DEV_REDIRECT="" in production
 * to disable.
 */
export function recipientFor(originalEmail: string): string {
  const redirect = process.env.RESEND_DEV_REDIRECT?.trim();
  if (redirect && redirect.length > 0) return redirect;
  return originalEmail;
}
