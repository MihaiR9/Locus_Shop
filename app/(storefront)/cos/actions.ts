"use server";

import { validateCoupon } from "@/lib/coupons";

export type ApplyVoucherResult =
  | {
      ok: true;
      code: string;
      /** Reducere calculată pe subtotal-ul trimis, în bani. Doar informativ —
       *  recalculăm final la createOrder pe DB-side price. */
      discountCents: number;
    }
  | { ok: false; error: string };

/**
 * Validează codul introdus la /cos și returnează reducerea aplicabilă
 * pentru afișare. Nu marcăm cuponul ca „folosit" aici — asta se face
 * la finalizarea plății, în webhook-ul Stripe.
 */
export async function applyVoucherAction(
  code: string,
  subtotalCents: number,
): Promise<ApplyVoucherResult> {
  const res = await validateCoupon(code, subtotalCents);
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, code: res.code, discountCents: res.discountCents };
}
