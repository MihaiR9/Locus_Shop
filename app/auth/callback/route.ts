import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Auth callback for email links + OAuth.
 *
 * Email links (magic link, signup, recovery, email change) arrive as
 *   /auth/callback?next=/cont&token_hash=<hash>&type=email
 * built by the Supabase templates from `{{ .RedirectTo }}`. verifyOtp()
 * works in any browser — the PKCE `code` flow did not: it needs the
 * verifier cookie from the browser that requested the link, so opening
 * the email on another device or in the Gmail app failed with
 * "code challenge does not match previously saved code verifier".
 *
 * OAuth (Google) still returns `?code=`, exchanged here as before.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(searchParams.get("next"));

  const supabase = await getSupabaseServerClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    console.error("auth callback verifyOtp failed:", error.message);
    return loginWithError(origin, error.message);
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    console.error("auth callback exchange failed:", error.message);
    return loginWithError(origin, error.message);
  }

  const supabaseError = searchParams.get("error_code") ?? searchParams.get("error");
  return loginWithError(origin, supabaseError ?? "missing_code");
}

function safeNext(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/cont";
}

function loginWithError(origin: string, error: string) {
  return NextResponse.redirect(`${origin}/cont/login?error=${encodeURIComponent(error)}`);
}
