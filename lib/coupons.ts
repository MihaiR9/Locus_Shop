import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type CouponValidation =
  | {
      ok: true;
      couponId: string;
      code: string;
      discountCents: number;
    }
  | { ok: false; error: string };

export async function validateCoupon(
  codeRaw: string,
  subtotalCents: number,
): Promise<CouponValidation> {
  const code = codeRaw.trim().toUpperCase();
  if (!code) return { ok: false, error: "Introdu un cod." };

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (error) return { ok: false, error: "Cod invalid." };
  if (!data) return { ok: false, error: "Cod invalid." };
  if (!data.active) return { ok: false, error: "Cuponul nu este activ." };

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { ok: false, error: "Cuponul a expirat." };
  }

  if (data.max_uses !== null && data.used_count >= data.max_uses) {
    return { ok: false, error: "Cuponul a fost epuizat." };
  }

  if (subtotalCents < data.min_amount_cents) {
    const min = (data.min_amount_cents / 100).toFixed(2).replace(".", ",");
    return {
      ok: false,
      error: `Coșul minim pentru acest cod este ${min} lei.`,
    };
  }

  let discountCents = 0;
  if (data.percent_off !== null) {
    discountCents = Math.floor((subtotalCents * data.percent_off) / 100);
  } else if (data.fixed_off_cents !== null) {
    discountCents = Math.min(data.fixed_off_cents, subtotalCents);
  }

  return {
    ok: true,
    couponId: data.id,
    code: data.code,
    discountCents,
  };
}

export async function incrementCouponUse(couponId: string): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("coupons")
    .select("used_count")
    .eq("id", couponId)
    .maybeSingle();
  if (!data) return;

  await supabase
    .from("coupons")
    .update({ used_count: data.used_count + 1 })
    .eq("id", couponId);
}
