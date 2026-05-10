"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/current-user";

type Result =
  | { ok: true; returnNumber: string }
  | { ok: false; error: string };

type SubmitInput = {
  orderNumber: string;
  orderItemIds: string[];
  productState: "sigilat" | "deteriorat" | "neconform";
  resolution: "rambursare" | "inlocuire" | "voucher";
  reason: string;
  iban?: string;
};

export async function submitReturnRequest(
  input: SubmitInput,
): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesiune expirată." };

  if (input.orderItemIds.length === 0) {
    return { ok: false, error: "Selectează cel puțin un produs." };
  }
  if (input.productState === "neconform" && input.reason.trim().length < 10) {
    return {
      ok: false,
      error: "Pentru produs neconform, descrie pe scurt ce nu corespunde.",
    };
  }
  if (input.resolution === "rambursare") {
    const cleanIban = (input.iban ?? "").trim();
    if (cleanIban.length < 15) {
      return {
        ok: false,
        error: "Pentru rambursare, completează un IBAN valid.",
      };
    }
  }

  const supabase = await getSupabaseServerClient();
  const admin = getSupabaseAdminClient();

  // Fetch order + items, validate ownership
  const { data: orderRow } = await supabase
    .from("orders")
    .select("id, order_number, customer_id")
    .eq("order_number", input.orderNumber)
    .eq("customer_id", user.customerId)
    .maybeSingle();

  if (!orderRow) {
    return { ok: false, error: "Comanda nu a fost găsită." };
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("id, code_snapshot, name_snapshot, qty, unit_price_cents, order_id")
    .in("id", input.orderItemIds);

  const validItems = (items ?? []).filter((it) => it.order_id === orderRow.id);
  if (validItems.length === 0) {
    return { ok: false, error: "Produsele selectate nu aparțin comenzii." };
  }

  // Per-year sequential return number — service_role bypasses RLS for the rpc.
  const year = new Date().getFullYear();
  const { data: numberRes, error: numberErr } = await admin.rpc(
    "next_return_number",
    { p_year: year },
  );
  if (numberErr || !numberRes) {
    return {
      ok: false,
      error: numberErr?.message ?? "Nu s-a putut genera numărul retur.",
    };
  }
  const returnNumber = numberRes as string;

  // Insert return + items via admin so we can do both atomically
  // (RLS would still allow because the user IS the owner — but admin
  // sidesteps the trigger overhead).
  const { data: insertedReturn, error: insertErr } = await admin
    .from("returns")
    .insert({
      return_number: returnNumber,
      customer_id: user.customerId,
      order_id: orderRow.id,
      product_state: input.productState,
      resolution: input.resolution,
      reason: input.reason.trim() || null,
      iban: input.iban?.trim() || null,
    })
    .select("id")
    .single();

  if (insertErr || !insertedReturn) {
    return {
      ok: false,
      error: insertErr?.message ?? "Nu s-a putut salva cererea.",
    };
  }

  const itemRows = validItems.map((it) => ({
    return_id: insertedReturn.id,
    order_item_id: it.id,
    product_code: it.code_snapshot,
    product_name: it.name_snapshot,
    qty: it.qty,
    unit_price_cents: it.unit_price_cents,
  }));

  const { error: itemsErr } = await admin.from("return_items").insert(itemRows);
  if (itemsErr) {
    // best effort cleanup
    await admin.from("returns").delete().eq("id", insertedReturn.id);
    return { ok: false, error: itemsErr.message };
  }

  revalidatePath("/cont/retururi");
  revalidatePath("/cont");
  return { ok: true, returnNumber };
}
