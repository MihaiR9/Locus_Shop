import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getSiteUrl } from "@/lib/site";

/** Cât rămâne valabil linkul de plată trimis în reminder. */
export const PAYMENT_LINK_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/* Linkul e semnat, nu salvat în DB: oricine îl are poate plăti comanda,
   dar nu poate fabrica unul pentru altă comandă sau prelungi expirarea.
   Cheia derivă din service role key, care e deja secretă pe server. */
function signingKey(): Buffer {
  const secret =
    process.env.PAYMENT_LINK_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("No secret available to sign payment links.");
  return createHmac("sha256", secret).update("locus-payment-link").digest();
}

function signature(orderNumber: string, expiresAt: number): string {
  return createHmac("sha256", signingKey())
    .update(`${orderNumber}.${expiresAt}`)
    .digest("base64url");
}

export function createPaymentLink(orderNumber: string): {
  url: string;
  expiresAt: Date;
} {
  const exp = Date.now() + PAYMENT_LINK_TTL_MS;
  const params = new URLSearchParams({
    exp: String(exp),
    sig: signature(orderNumber, exp),
  });
  return {
    url: `${getSiteUrl()}/plata/${encodeURIComponent(orderNumber)}?${params}`,
    expiresAt: new Date(exp),
  };
}

export type PaymentLinkCheck = "valid" | "invalid" | "expired";

export function verifyPaymentLink(
  orderNumber: string,
  exp: string | undefined,
  sig: string | undefined,
): PaymentLinkCheck {
  const expiresAt = Number(exp);
  if (!sig || !Number.isFinite(expiresAt)) return "invalid";

  const expected = Buffer.from(signature(orderNumber, expiresAt));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return "invalid";
  }
  return Date.now() > expiresAt ? "expired" : "valid";
}
