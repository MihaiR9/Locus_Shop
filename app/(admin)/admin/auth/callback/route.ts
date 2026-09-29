import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Callback pentru magic link ADMIN. După autentificare:
 * - dacă user-ul e admin (`app_metadata.role === "admin"`) → /admin
 * - altfel → sign out + /admin/login cu mesaj de eroare
 *
 * Linkul din email vine cu `token_hash` (merge în orice browser); `code`
 * rămâne pentru linkurile vechi, trimise înainte de schimbarea șablonului.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (!code && !(tokenHash && type)) {
    const supabaseError = searchParams.get("error_code") ?? "missing_code";
    return NextResponse.redirect(
      `${origin}/admin/login?error=${encodeURIComponent(supabaseError)}`,
    );
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } =
    tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : await supabase.auth.exchangeCodeForSession(code!);

  if (error || !data.user) {
    return NextResponse.redirect(
      `${origin}/admin/login?error=${encodeURIComponent(error?.message ?? "exchange_failed")}`,
    );
  }

  const role = (data.user.app_metadata as { role?: string } | undefined)?.role;
  if (role !== "admin") {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      `${origin}/admin/login?error=${encodeURIComponent("Contul nu are permisiuni admin.")}`,
    );
  }

  return NextResponse.redirect(`${origin}/admin`);
}
