import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type CouponRow = {
  id: string;
  code: string;
  percentOff: number | null;
  fixedOffCents: number | null;
  minAmountCents: number;
  expiresAt: string | null;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  createdAt: string;
};

export type CouponStatus =
  | "active"
  | "inactive"
  | "expired"
  | "exhausted"
  | "upcoming";

export function couponStatus(c: CouponRow): CouponStatus {
  if (!c.active) return "inactive";
  if (c.expiresAt && new Date(c.expiresAt) < new Date()) return "expired";
  if (c.maxUses !== null && c.usedCount >= c.maxUses) return "exhausted";
  return "active";
}

export type CouponsListResult = {
  items: CouponRow[];
  kpis: {
    total: number;
    active: number;
    expired: number;
    totalUses: number;
  };
};

export async function listCoupons(): Promise<CouponsListResult> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[listCoupons]", error.message, error.code);
    return {
      items: [],
      kpis: { total: 0, active: 0, expired: 0, totalUses: 0 },
    };
  }

  const items: CouponRow[] = (data ?? []).map((c) => ({
    id: c.id,
    code: c.code,
    percentOff: c.percent_off,
    fixedOffCents: c.fixed_off_cents,
    minAmountCents: c.min_amount_cents,
    expiresAt: c.expires_at,
    maxUses: c.max_uses,
    usedCount: c.used_count,
    active: c.active,
    createdAt: c.created_at,
  }));

  const now = new Date();
  const active = items.filter((c) => couponStatus(c) === "active").length;
  const expired = items.filter(
    (c) => c.expiresAt && new Date(c.expiresAt) < now,
  ).length;

  return {
    items,
    kpis: {
      total: items.length,
      active,
      expired,
      totalUses: items.reduce((s, c) => s + c.usedCount, 0),
    },
  };
}

export async function getCouponByCode(
  code: string,
): Promise<CouponRow | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .maybeSingle();

  if (error) {
    console.error("[getCouponByCode]", error.message, error.code);
    return null;
  }
  if (!data) return null;

  return {
    id: data.id,
    code: data.code,
    percentOff: data.percent_off,
    fixedOffCents: data.fixed_off_cents,
    minAmountCents: data.min_amount_cents,
    expiresAt: data.expires_at,
    maxUses: data.max_uses,
    usedCount: data.used_count,
    active: data.active,
    createdAt: data.created_at,
  };
}
