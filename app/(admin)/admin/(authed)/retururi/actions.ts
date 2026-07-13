"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/current-admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ReturnStatus } from "@/lib/admin/returns-constants";

type Result = { ok: true } | { ok: false; error: string };

async function requireAdmin(): Promise<Result> {
  const admin = await getCurrentAdmin();
  if (!admin) return { ok: false, error: "Neautorizat." };
  return { ok: true };
}

export async function updateReturnStatus(
  returnNumber: string,
  newStatus: ReturnStatus,
): Promise<Result> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("returns")
    .update({ status: newStatus })
    .eq("return_number", returnNumber);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/retururi");
  revalidatePath(`/admin/retururi/${returnNumber}`);
  return { ok: true };
}

export async function deleteReturn(returnNumber: string): Promise<Result> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("returns")
    .delete()
    .eq("return_number", returnNumber);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/retururi");
  redirect("/admin/retururi");
}
