"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/current-user";

type Result = { ok: true; message?: string } | { ok: false; error: string };

type AddressInput = {
  line1: string;
  line2?: string;
  city: string;
  county: string;
  zip?: string;
  isDefault: boolean;
};

function validate(input: AddressInput): string | null {
  if (input.line1.trim().length < 4) return "Adresa (linia 1) e prea scurtă.";
  if (input.city.trim().length < 2) return "Orașul e obligatoriu.";
  if (input.county.trim().length < 2) return "Județul e obligatoriu.";
  return null;
}

export async function addAddress(input: AddressInput): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesiune expirată." };

  const err = validate(input);
  if (err) return { ok: false, error: err };

  const supabase = await getSupabaseServerClient();

  if (input.isDefault) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("customer_id", user.customerId)
      .eq("kind", "shipping");
  }

  const { error } = await supabase.from("addresses").insert({
    customer_id: user.customerId,
    kind: "shipping",
    line1: input.line1.trim(),
    line2: input.line2?.trim() || null,
    city: input.city.trim(),
    county: input.county.trim(),
    zip: input.zip?.trim() || null,
    is_default: input.isDefault,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/cont/adrese");
  return { ok: true, message: "Adresă adăugată." };
}

export async function updateAddress(
  id: string,
  input: AddressInput,
): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesiune expirată." };

  const err = validate(input);
  if (err) return { ok: false, error: err };

  const supabase = await getSupabaseServerClient();

  if (input.isDefault) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("customer_id", user.customerId)
      .eq("kind", "shipping")
      .neq("id", id);
  }

  const { error } = await supabase
    .from("addresses")
    .update({
      line1: input.line1.trim(),
      line2: input.line2?.trim() || null,
      city: input.city.trim(),
      county: input.county.trim(),
      zip: input.zip?.trim() || null,
      is_default: input.isDefault,
    })
    .eq("id", id)
    .eq("customer_id", user.customerId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/cont/adrese");
  return { ok: true, message: "Adresă actualizată." };
}

export async function deleteAddress(id: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesiune expirată." };

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", id)
    .eq("customer_id", user.customerId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/cont/adrese");
  return { ok: true, message: "Adresă ștearsă." };
}
