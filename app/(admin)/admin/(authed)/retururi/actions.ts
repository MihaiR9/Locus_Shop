"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/current-admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { sendReturnStatusUpdate } from "@/lib/email/send";
import type { ReturnStatus } from "@/lib/admin/returns-constants";

type Result = { ok: true } | { ok: false; error: string };

async function requireAdmin(): Promise<Result> {
  const admin = await getCurrentAdmin();
  if (!admin) return { ok: false, error: "Neautorizat." };
  return { ok: true };
}

// Statusuri „pending" nu declanșează email (clientul deja a inițiat cererea).
// Toate celelalte da.
const NOTIFY_STATUSES: ReturnStatus[] = [
  "approved",
  "in_transit",
  "completed",
  "rejected",
];

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

  // Email client — fail silent, nu blochează update-ul de status.
  if (NOTIFY_STATUSES.includes(newStatus)) {
    const { data: ret } = await supabase
      .from("returns")
      .select("id, return_number, customer_id, order_id")
      .eq("return_number", returnNumber)
      .maybeSingle();

    if (ret) {
      const [{ data: customer }, { data: order }] = await Promise.all([
        supabase
          .from("customers")
          .select("email, name")
          .eq("id", ret.customer_id)
          .maybeSingle(),
        supabase
          .from("orders")
          .select("order_number")
          .eq("id", ret.order_id)
          .maybeSingle(),
      ]);

      if (customer?.email) {
        await sendReturnStatusUpdate(customer.email, {
          returnNumber: ret.return_number,
          orderNumber: order?.order_number ?? null,
          customerName: customer.name ?? undefined,
          status: newStatus as
            | "approved"
            | "in_transit"
            | "completed"
            | "rejected",
        });
      }
    }
  }

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
