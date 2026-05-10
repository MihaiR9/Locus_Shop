import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Auth callback for magic-link + OAuth.
 *
 * Magic link emails Supabase generates contain a redirect URL like:
 *   https://<site>/auth/callback?code=<one-time-code>&next=/cont
 *
 * For OAuth (Google), the same URL pattern is used after the provider
 * redirects back. exchangeCodeForSession() converts the one-time code
 * into a server-side session cookie.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/cont";

  if (code) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("auth callback exchange failed:", error.message);
    return NextResponse.redirect(
      `${origin}/cont/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(`${origin}/cont/login?error=missing_code`);
}
