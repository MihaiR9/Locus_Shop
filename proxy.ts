import { NextResponse, type NextRequest } from "next/server";

/**
 * Auth gating pentru rutele admin.
 *
 * Acum: check trivial pe cookie `locus-admin-session`. Dacă lipsește, redirect
 * la /admin/login. Pagina de login setează un cookie mock.
 *
 * La Faza 2: înlocuim verificarea cu Supabase session + role check
 * (`auth.users.app_metadata.role === 'admin'`). Tot fluxul magic-link va merge
 * prin /admin/auth/callback pentru a seta session cookie-ul Supabase.
 *
 * Fișierul ăsta înlocuiește vechiul middleware.ts (deprecated în Next 16).
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Doar rutele /admin/* sunt protejate. /admin/login e excepție.
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();

  const session = req.cookies.get("locus-admin-session");
  if (session?.value) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("redirect", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  // Rulează doar pe rutele admin (skip API, _next/static, etc.)
  matcher: ["/admin/:path*"],
};
