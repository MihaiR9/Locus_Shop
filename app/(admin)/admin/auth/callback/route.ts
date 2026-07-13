import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Callback pentru magic link ADMIN. După exchange:
 * - dacă user-ul e admin (`app_metadata.role === "admin"`) → /admin
 * - altfel → sign out + /admin/login cu mesaj de eroare
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/admin/login?error=missing_code`);
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

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
