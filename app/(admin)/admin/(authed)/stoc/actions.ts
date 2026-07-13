"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/auth/current-admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type Result = { ok: true; newStock: number } | { ok: false; error: string };

export async function updateStock(
  productId: string,
  newStock: number,
): Promise<Result> {
  const admin = await getCurrentAdmin();
  if (!admin) return { ok: false, error: "Neautorizat." };

  if (!Number.isFinite(newStock) || newStock < 0) {
    return { ok: false, error: "Stoc invalid." };
  }
  const value = Math.floor(newStock);
  if (value > 100000) return { ok: false, error: "Stoc prea mare." };

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("products")
    .update({ stock: value })
    .eq("id", productId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/stoc");
  revalidatePath("/admin/produse");
  return { ok: true, newStock: value };
}

export async function adjustStock(
  productId: string,
  delta: number,
): Promise<Result> {
  const admin = await getCurrentAdmin();
  if (!admin) return { ok: false, error: "Neautorizat." };
  if (!Number.isFinite(delta) || delta === 0) {
    return { ok: false, error: "Ajustare invalidă." };
  }

  const supabase = await getSupabaseServerClient();
  const { data: current, error: readErr } = await supabase
    .from("products")
    .select("stock")
    .eq("id", productId)
    .maybeSingle();
  if (readErr || !current) {
    return { ok: false, error: readErr?.message ?? "Produs inexistent." };
  }

  const next = Math.max(0, current.stock + Math.floor(delta));
  const { error } = await supabase
    .from("products")
    .update({ stock: next })
    .eq("id", productId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/stoc");
  revalidatePath("/admin/produse");
  return { ok: true, newStock: next };
}
