import { NextResponse, type NextRequest } from "next/server";

const PREVIEW_COOKIE = "locus-preview";
const PREVIEW_MAX_AGE = 60 * 60 * 24 * 30; // 30 zile

/**
 * Proxy (fost `middleware.ts` în Next 15). Două responsabilități:
 *
 * 1. **Coming-soon gate** — când `COMING_SOON=true`, orice request e
 *    rewrite-uit la `/coming-soon`. Excepții: pagina în sine, assets din
 *    `/brand` și `/photos`, favicon/robots/sitemap, webhook-ul Stripe.
 *    Bypass echipă: `?preview=<COMING_SOON_PREVIEW_TOKEN>` pe orice URL
 *    setează cookie 30 zile.
 *
 * 2. **Auth gating pentru /admin/*** — check pe cookie `locus-admin-session`.
 *    Dacă lipsește, redirect la /admin/login. La Faza 2: Supabase session +
 *    role check (`auth.users.app_metadata.role === 'admin'`).
 */
export function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // ─── 1) COMING-SOON GATE ─────────────────────────────────────
  if (process.env.COMING_SOON === "true") {
    const isWhitelisted =
      pathname === "/coming-soon" ||
      pathname.startsWith("/photos") ||
      pathname.startsWith("/brand") ||
      pathname === "/favicon.ico" ||
      pathname === "/robots.txt" ||
      pathname === "/sitemap.xml" ||
      pathname === "/api/stripe/webhook";

    if (!isWhitelisted) {
      const token = process.env.COMING_SOON_PREVIEW_TOKEN;
      const previewParam = searchParams.get("preview");

      // Preview link → set cookie + curăță param.
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

  // ─── 2) ADMIN AUTH GATE ──────────────────────────────────────
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
  // Rulează pe tot — coming-soon gate trebuie să vadă toate rutele.
  // Excludem doar internals și optimized image endpoint (perf).
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
