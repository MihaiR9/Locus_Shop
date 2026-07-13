import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PREVIEW_COOKIE = "locus-preview";
const PREVIEW_MAX_AGE = 60 * 60 * 24 * 30; // 30 zile

/**
 * Proxy (fost `middleware.ts` în Next 15). Trei responsabilități:
 *
 * 1. **Coming-soon gate** — când `COMING_SOON=true`, orice request e
 *    rewrite-uit la `/coming-soon`. Excepții: pagina în sine, assets din
 *    `/brand` și `/photos`, favicon/robots/sitemap, webhook-ul Stripe.
 *    Bypass echipă: `?preview=<COMING_SOON_PREVIEW_TOKEN>` pe orice URL
 *    setează cookie 30 zile.
 *
 * 2. **Sesiune Supabase refresh** — `getUser()` reînnoiește tokens și
 *    setează cookies noi în response.
 *
 * 3. **Auth gating pentru /admin/*** — verifică `app_metadata.role === "admin"`
 *    pe sesiunea Supabase. Fără rol → redirect la `/admin/login`.
 */
export async function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // ─── 1) COMING-SOON GATE ─────────────────────────────────────
  if (process.env.COMING_SOON === "true") {
    const isWhitelisted =
      pathname === "/coming-soon" ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/auth/callback") ||
      pathname.startsWith("/photos") ||
      pathname.startsWith("/brand") ||
      pathname === "/favicon.ico" ||
      pathname === "/robots.txt" ||
      pathname === "/sitemap.xml" ||
      pathname === "/api/stripe/webhook";

    if (!isWhitelisted) {
      const token = process.env.COMING_SOON_PREVIEW_TOKEN;
      const previewParam = searchParams.get("preview");

      if (token && previewParam && previewParam === token) {
        const cleanUrl = req.nextUrl.clone();
        cleanUrl.searchParams.delete("preview");
        const res = NextResponse.redirect(cleanUrl);
        res.cookies.set(PREVIEW_COOKIE, "1", {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          maxAge: PREVIEW_MAX_AGE,
          secure: process.env.NODE_ENV === "production",
        });
        return res;
      }

      const hasBypassCookie = req.cookies.get(PREVIEW_COOKIE)?.value === "1";
      if (!hasBypassCookie) {
        const url = req.nextUrl.clone();
        url.pathname = "/coming-soon";
        url.search = "";
        return NextResponse.rewrite(url);
      }
    }
  }

  // ─── 2 + 3) SUPABASE SESSION + ADMIN GATE ────────────────────
  // Restul aplicației (storefront, /cont) nu are nevoie de auth în
  // middleware — server components apelează `getCurrentUser()` direct.
  // Doar /admin/* trebuie protejat aici + reînnoire tokens per request.
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();
  if (pathname.startsWith("/admin/auth/callback")) return NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    // Env-uri lipsă → nu putem verifica, redirect la login.
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  const res = NextResponse.next();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          res.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = (user?.app_metadata as { role?: string } | undefined)?.role;

  if (!user || role !== "admin") {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
