"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type Result =
  | { ok: true; nextStage?: "code"; phone?: string }
  | { ok: false; error: string };

async function getOrigin() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export async function loginWithEmail(email: string): Promise<Result> {
  const clean = email.trim().toLowerCase();
  if (!clean.includes("@")) return { ok: false, error: "Adresă de email invalidă." };

  const supabase = await getSupabaseServerClient();
  const origin = await getOrigin();

  const { error } = await supabase.auth.signInWithOtp({
    email: clean,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/cont`,
      shouldCreateUser: true,
    },
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signupWithEmail(args: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  marketing: boolean;
}): Promise<Result> {
  const email = args.email.trim().toLowerCase();
  if (!email.includes("@")) return { ok: false, error: "Adresă de email invalidă." };
  if (args.firstName.trim().length < 2) return { ok: false, error: "Prenumele e prea scurt." };
  if (args.lastName.trim().length < 2) return { ok: false, error: "Numele e prea scurt." };

  const supabase = await getSupabaseServerClient();
  const origin = await getOrigin();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/cont`,
      shouldCreateUser: true,
      data: {
        first_name: args.firstName.trim(),
        last_name: args.lastName.trim(),
        phone: args.phone.trim() || null,
        marketing_opt_in: args.marketing,
      },
    },
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function startPhoneOtp(phone: string): Promise<Result> {
  const clean = phone.replace(/\s+/g, "");
  if (!/^(\+?40)?0?7\d{8}$/.test(clean)) {
    return { ok: false, error: "Număr de telefon invalid (ex: 0752 232 912)." };
  }

  // Normalize to +40 international format Supabase expects.
  let normalized = clean;
  if (normalized.startsWith("0")) normalized = "+4" + normalized;
  else if (normalized.startsWith("40")) normalized = "+" + normalized;
  else if (normalized.startsWith("7")) normalized = "+40" + normalized;

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({ phone: normalized });
  if (error) return { ok: false, error: error.message };
  return { ok: true, nextStage: "code", phone: normalized };
}

export async function verifyPhoneOtp(args: {
  phone: string;
  code: string;
}): Promise<Result> {
  if (!/^\d{6}$/.test(args.code)) return { ok: false, error: "Codul are 6 cifre." };

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    phone: args.phone,
    token: args.code,
    type: "sms",
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function startGoogleOAuth(): Promise<{ url: string } | { error: string }> {
  const supabase = await getSupabaseServerClient();
  const origin = await getOrigin();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=/cont`,
    },
  });
  if (error || !data.url) return { error: error?.message ?? "OAuth start failed" };
  return { url: data.url };
}

export async function logoutAction() {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
