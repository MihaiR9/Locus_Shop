"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/current-user";

type Result = { ok: true; message?: string } | { ok: false; error: string };

async function getOrigin() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export async function updateName(args: {
  firstName: string;
  lastName: string;
}): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesiune expirată." };

  if (args.firstName.trim().length < 2)
    return { ok: false, error: "Prenumele e prea scurt." };
  if (args.lastName.trim().length < 2)
    return { ok: false, error: "Numele e prea scurt." };

  const fullName = `${args.firstName.trim()} ${args.lastName.trim()}`;

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("customers")
    .update({ name: fullName })
    .eq("id", user.customerId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/cont/setari");
  revalidatePath("/cont", "layout");
  return { ok: true, message: "Nume actualizat." };
}

export async function updatePhone(phone: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesiune expirată." };

  if (phone) {
    const clean = phone.replace(/\s+/g, "");
    if (!/^(\+?40)?0?7\d{8}$/.test(clean)) {
      return { ok: false, error: "Telefon invalid (ex: 0752 232 912)." };
    }
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("customers")
    .update({ phone: phone.trim() || null })
    .eq("id", user.customerId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/cont/setari");
  return { ok: true, message: "Telefon actualizat." };
}

export async function updateMarketing(marketing: boolean): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesiune expirată." };

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("customers")
    .update({ marketing_opt_in: marketing })
    .eq("id", user.customerId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/cont/setari");
  return {
    ok: true,
    message: marketing ? "Te-ai abonat la newsletter." : "Te-ai dezabonat.",
  };
}

export async function requestEmailChange(newEmail: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesiune expirată." };
  const clean = newEmail.trim().toLowerCase();
  if (!clean.includes("@"))
    return { ok: false, error: "Adresă de email invalidă." };

  const supabase = await getSupabaseServerClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.updateUser(
    { email: clean },
    { emailRedirectTo: `${origin}/auth/callback?next=/cont/setari` },
  );
  if (error) return { ok: false, error: error.message };

  return {
    ok: true,
    message: `Ți-am trimis link de confirmare la ${clean}. Click pe el ca să confirmi schimbarea.`,
  };
}

export async function requestPasswordChange(): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesiune expirată." };

  const supabase = await getSupabaseServerClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${origin}/auth/callback?next=/cont/setari`,
  });
  if (error) return { ok: false, error: error.message };

  return {
    ok: true,
    message: `Ți-am trimis pe ${user.email} un link pentru setarea unei parole noi.`,
  };
}

export async function requestAccountDeletion(): Promise<Result> {
  // Soft-flag the customer for deletion. Hard delete (auth.users + cascading
  // customers/orders) runs in a manual cron after legal retention review,
  // anonymizing finalized orders that must be kept 10 years for fiscal law.
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesiune expirată." };

  // For now we just record an audit_log entry; no hard delete.
  const admin = getSupabaseAdminClient();
  const { error } = await admin.from("audit_log").insert({
    actor: user.email,
    action: "account_deletion_requested",
    entity: "customers",
    entity_id: user.customerId,
    after: { requested_at: new Date().toISOString() },
  });
  if (error) return { ok: false, error: error.message };

  return {
    ok: true,
    message:
      "Cererea ta a fost înregistrată. Procesăm ștergerea în 30 de zile (GDPR). Vei primi confirmare pe email.",
  };
}
