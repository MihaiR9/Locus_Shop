import "server-only";
import Stripe from "stripe";

/**
 * Singleton Stripe client. The SDK reads `apiVersion` from the secret-key
 * tied account, but pinning it here avoids surprise breakage when
 * Stripe ships a new version. Bump deliberately when we want new features.
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error(
      "STRIPE_SECRET_KEY missing. Add it to .env.local — see .env.local.example.",
    );
  }
  _stripe = new Stripe(secret, {
    apiVersion: "2026-04-22.dahlia",
    appInfo: {
      name: "Domeniul Locus",
      version: "0.1.0",
    },
    typescript: true,
  });
  return _stripe;
}

/** Site URL used to build Stripe success/cancel redirect URLs. */
export function getSiteUrl(): string {
  // Vercel sets VERCEL_URL on prod/preview; locally we fall back to
  // localhost:3000 unless NEXT_PUBLIC_SITE_URL is set explicitly.
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
