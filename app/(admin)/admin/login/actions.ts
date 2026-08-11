"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

async function getOrigin() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

/**
 * Magic link admin. `shouldCreateUser: false` — nu vrem să se creeze
 * conturi noi cu drept de admin din login form. Rolul se setează manual
 * în Supabase Studio.
 */
export async function adminLoginWithEmail(email: string): Promise<Result> {
  const clean = email.trim().toLowerCase();
  if (!clean.includes("@")) return { ok: false, error: "Adresă de email invalidă." };

  const supabase = await getSupabaseServerClient();
  const origin = await getOrigin();

  const { error } = await supabase.auth.signInWithOtp({
    email: clean,
    options: {
      emailRedirectTo: `${origin}/admin/auth/callback`,
      shouldCreateUser: false,
    },
  });

  if (error) {
    /* Mesajul de dinainte spunea „Nu există cont cu această adresă" pentru
       trei situații distincte, așa că un cont existent dar neconfirmat sau
       o limită de trimitere atinsă arătau identic cu o adresă greșită. Le
       separăm — altfel diagnosticarea e ghicit. */
    const msg = error.message.toLowerCase();

    if (msg.includes("rate limit") || msg.includes("too many")) {
      return {
        ok: false,
        error:
          "Prea multe cereri într-un interval scurt. Așteaptă câteva minute și încearcă din nou.",
      };
    }

    if (
      msg.includes("signups not allowed") ||
      msg.includes("user not found") ||
      error.code === "otp_disabled"
    ) {
      return {
        ok: false,
        error:
          "Nu există cont activ cu această adresă, sau contul nu are emailul confirmat. Verifică în Supabase → Authentication → Users.",
      };
    }

    // Restul: mesajul brut de la Supabase, plus codul, ca să se poată căuta.
    console.error("[admin-login] signInWithOtp a esuat", {
      email: clean,
      code: error.code,
      message: error.message,
    });
    return { ok: false, error: `${error.message}${error.code ? ` (${error.code})` : ""}` };
  }
  return { ok: true };
}

export async function adminLogoutAction() {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
