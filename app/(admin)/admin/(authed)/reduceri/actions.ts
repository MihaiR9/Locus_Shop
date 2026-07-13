"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/current-admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

async function requireAdmin(): Promise<Result> {
  const admin = await getCurrentAdmin();
  if (!admin) return { ok: false, error: "Neautorizat." };
  return { ok: true };
}

type CouponPayload = {
  code: string;
  discountType: "percent" | "fixed";
  percentOff: number | null;
  fixedOffCents: number | null;
  minAmountCents: number;
  expiresAt: string | null;
  maxUses: number | null;
  active: boolean;
};

function parsePayload(
  formData: FormData,
): CouponPayload | { error: string } {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,40}$/.test(code)) {
    return {
      error: "Codul trebuie să aibă 3-40 caractere: litere mari, cifre, - sau _.",
    };
  }

  const discountType = String(formData.get("discount_type") ?? "percent") as
    | "percent"
    | "fixed";

  let percentOff: number | null = null;
  let fixedOffCents: number | null = null;

  if (discountType === "percent") {
    const raw = String(formData.get("percent_off") ?? "").trim();
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0 || n > 100) {
      return { error: "Procentul trebuie să fie între 1 și 100." };
    }
    percentOff = Math.floor(n);
  } else {
    const raw = String(formData.get("fixed_off_ron") ?? "").trim().replace(",", ".");
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) {
      return { error: "Suma fixă trebuie să fie pozitivă." };
    }
    fixedOffCents = Math.round(n * 100);
  }

  const minRaw = String(formData.get("min_amount_ron") ?? "0")
    .trim()
    .replace(",", ".");
  const minN = Number(minRaw);
  const minAmountCents =
    Number.isFinite(minN) && minN >= 0 ? Math.round(minN * 100) : 0;

  const expiresRaw = String(formData.get("expires_at") ?? "").trim();
  const expiresAt = expiresRaw ? new Date(expiresRaw).toISOString() : null;

  const maxUsesRaw = String(formData.get("max_uses") ?? "").trim();
  const maxUsesN = Number(maxUsesRaw);
  const maxUses =
    maxUsesRaw && Number.isFinite(maxUsesN) && maxUsesN > 0
      ? Math.floor(maxUsesN)
      : null;

  const active = formData.get("active") === "on";

  return {
    code,
    discountType,
    percentOff,
    fixedOffCents,
    minAmountCents,
    expiresAt,
    maxUses,
    active,
  };
}

export async function createCoupon(formData: FormData): Promise<Result> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const payload = parsePayload(formData);
  if ("error" in payload) return { ok: false, error: payload.error };

  const supabase = await getSupabaseServerClient();

  const { data: existing } = await supabase
    .from("coupons")
    .select("id")
    .eq("code", payload.code)
    .maybeSingle();
  if (existing) return { ok: false, error: "Codul e deja folosit." };

  const { data: inserted, error } = await supabase
    .from("coupons")
    .insert({
      code: payload.code,
      percent_off: payload.percentOff,
      fixed_off_cents: payload.fixedOffCents,
      min_amount_cents: payload.minAmountCents,
      expires_at: payload.expiresAt,
      max_uses: payload.maxUses,
      active: payload.active,
    })
    .select("code")
    .single();

  if (error || !inserted) {
    return { ok: false, error: error?.message ?? "Nu am putut crea cuponul." };
  }

  revalidatePath("/admin/reduceri");
  redirect(`/admin/reduceri/${inserted.code}`);
}

export async function updateCoupon(
  currentCode: string,
  formData: FormData,
): Promise<Result> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const payload = parsePayload(formData);
  if ("error" in payload) return { ok: false, error: payload.error };

  const supabase = await getSupabaseServerClient();

  const { data: current } = await supabase
    .from("coupons")
    .select("id, code")
    .eq("code", currentCode.toUpperCase())
    .maybeSingle();
  if (!current) return { ok: false, error: "Cuponul nu există." };

  if (payload.code !== current.code) {
    const { data: clash } = await supabase
      .from("coupons")
      .select("id")
      .eq("code", payload.code)
      .maybeSingle();
    if (clash) return { ok: false, error: "Noul cod e deja folosit." };
  }

  const { error } = await supabase
    .from("coupons")
    .update({
      code: payload.code,
      percent_off: payload.percentOff,
      fixed_off_cents: payload.fixedOffCents,
      min_amount_cents: payload.minAmountCents,
      expires_at: payload.expiresAt,
      max_uses: payload.maxUses,
      active: payload.active,
    })
    .eq("id", current.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/reduceri");
  revalidatePath(`/admin/reduceri/${payload.code}`);
  if (payload.code !== current.code) redirect(`/admin/reduceri/${payload.code}`);
  return { ok: true };
}

export async function deleteCoupon(code: string): Promise<Result> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("coupons")
    .delete()
    .eq("code", code.toUpperCase());
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/reduceri");
  redirect("/admin/reduceri");
}
