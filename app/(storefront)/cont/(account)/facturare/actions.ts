"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/current-user";

type Result = { ok: true; message?: string } | { ok: false; error: string };

type BillingInput = {
  company: string;
  cui: string;
  regNo?: string;
  iban?: string;
  hqAddress: string;
  isDefault: boolean;
};

function validate(input: BillingInput): string | null {
  if (input.company.trim().length < 2) return "Denumirea firmei e obligatorie.";
  if (!/^(RO)?\d{2,10}$/i.test(input.cui.replace(/\s+/g, "")))
    return "CUI invalid (ex: RO12345678 sau 12345678).";
  if (input.hqAddress.trim().length < 4) return "Sediul social e obligatoriu.";
  return null;
}

export async function addBillingProfile(input: BillingInput): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesiune expirată." };

  const err = validate(input);
  if (err) return { ok: false, error: err };

  const supabase = await getSupabaseServerClient();

  const { error } = await supabase.from("billing_profiles").insert({
    customer_id: user.customerId,
    type: "juridica",
    company: input.company.trim(),
    cui: input.cui.trim(),
    reg_no: input.regNo?.trim() || null,
    iban: input.iban?.trim() || null,
    hq_address: input.hqAddress.trim(),
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/cont/facturare");
  return { ok: true, message: "Firmă adăugată." };
}

export async function updateBillingProfile(
  id: string,
  input: BillingInput,
): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesiune expirată." };

  const err = validate(input);
  if (err) return { ok: false, error: err };

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("billing_profiles")
    .update({
      company: input.company.trim(),
      cui: input.cui.trim(),
      reg_no: input.regNo?.trim() || null,
      iban: input.iban?.trim() || null,
      hq_address: input.hqAddress.trim(),
    })
    .eq("id", id)
    .eq("customer_id", user.customerId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/cont/facturare");
  return { ok: true, message: "Date actualizate." };
}

export async function deleteBillingProfile(id: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesiune expirată." };

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("billing_profiles")
    .delete()
    .eq("id", id)
    .eq("customer_id", user.customerId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/cont/facturare");
  return { ok: true, message: "Firmă ștearsă." };
}
