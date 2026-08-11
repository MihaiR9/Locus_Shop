import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PREVIEW_COOKIE = "locus-preview";
const PREVIEW_MAX_AGE = 60 * 60 * 24 * 30; // 30 zile

/**
 * Hostul pe care trăiește panoul de administrare, ex. `admin.domeniul-locus.ro`.
 *
 * Gol → rutarea pe host e dezactivată și totul merge ca înainte (dev local,
 * unde nu ai subdomenii). Setat → cele două lumi se despart:
 *
 *   admin.domeniul-locus.ro  → doar /admin
 *   domeniul-locus.ro        → doar magazinul; /admin devine 404
 *
 * DE CE: cookie-urile de sesiune Supabase se scopează pe host (nu au
 * atribut Domain). Cu hosturi diferite, sesiunea de admin și cea de client
 * încetează să se calce — poți fi logat ca administrator într-o parte și ca
 * simplu client în cealaltă, simultan. Înainte, o sesiune de admin deschisă
 * te făcea să apari drept acel utilizator și în contul de pe magazin.
 */
const ADMIN_HOST = process.env.ADMIN_HOST?.trim().toLowerCase() ?? "";

/**
 * Construiește un URL absolut pe hostul DIN CARE a venit cererea.
 *
 * `req.nextUrl` poate purta hostul intern în spatele unui proxy. Pentru
 * redirectările din panou asta ar fi grav: ar arunca administratorul de pe
 * `admin.` înapoi pe apex, unde `/admin` răspunde 404 — buclă de login.
 */
function sameHostUrl(req: NextRequest, pathWithQuery: string): string {
  const proto =
    req.headers.get("x-forwarded-proto") ??
    (req.nextUrl.protocol.replace(":", "") || "https");
  const host = req.headers.get("host") ?? req.nextUrl.host;
  return `${proto}://${host}${pathWithQuery}`;
}

/** Rute care trebuie să funcționeze pe ORICE host. */
function isHostAgnostic(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.svg"
  );
}

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

  // ─── 0) RUTARE PE HOST — admin separat de magazin ────────────
  const host = req.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";
  const onAdminHost = ADMIN_HOST !== "" && host === ADMIN_HOST;

  if (ADMIN_HOST !== "" && !isHostAgnostic(pathname)) {
    if (onAdminHost) {
      // Pe hostul de admin, rădăcina duce direct în panou.
      //
      // URL-ul se construiește din antetul `host` primit, nu din
      // `req.nextUrl`: în spatele unui proxy, hostul din `nextUrl` poate fi
      // cel intern, iar redirectul ar arunca omul de pe subdomeniu înapoi
      // pe apex. (Un `Location` relativ ar fi fost mai simplu, dar Next
      // cere URL absolut în middleware — altfel „Invalid URL".)
      if (pathname === "/") {
        return NextResponse.redirect(sameHostUrl(req, "/admin"));
      }
      if (!pathname.startsWith("/admin")) {
        // Spre magazin, folosind domeniul canonic din config — nu ghicim
        // tăind prefixul „admin.", pentru că subdomeniul poate avea
        // oricând altă formă.
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
        if (siteUrl) {
          return NextResponse.redirect(new URL(pathname + req.nextUrl.search, siteUrl));
        }
        const url = req.nextUrl.clone();
        url.pathname = "/admin";
        return NextResponse.redirect(url);
      }
    } else if (pathname.startsWith("/admin")) {
      // Pe magazin, /admin nu există. Răspundem 404 sec, NU redirect spre
      // hostul de admin — nu anunțăm unde e panoul cui îl caută.
      return new NextResponse("Not found", {
        status: 404,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
  }

  // ─── 1) COMING-SOON GATE ─────────────────────────────────────
  // Hostul de admin nu e gate-uit: e deja protejat de verificarea de rol,
  // iar „în curând" n-are niciun sens într-un panou de administrare.
  if (process.env.COMING_SOON === "true" && !onAdminHost) {
    const isWhitelisted =
      pathname === "/coming-soon" ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/auth/callback") ||
      pathname.startsWith("/photos") ||
      pathname.startsWith("/brand") ||
      pathname === "/favicon.ico" ||
      pathname === "/robots.txt" ||
      pathname === "/sitemap.xml" ||
      // Feed-urile de produse răspund cu XML valid dar GOL cât timp gate-ul
      // e activ (vezi lib/feed/products.ts). Le lăsăm accesibile ca să poți
      // configura și testa Merchant Center / Meta înainte de lansare.
      pathname.startsWith("/api/feed/") ||
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
  // Sărim complet peste refresh pe rutele de auth callback — acolo
  // schimbăm codul PKCE pe sesiune, iar cookie-urile de code_verifier
  // (`sb-...-auth-token-code-verifier`) NU trebuie atinse între request-ul
  // de login și click-ul pe magic link. Dacă proxy-ul apelează getUser()
  // aici și eșuează, șterge cookie-urile PKCE → login pierdut → user
  // rămâne pe pagina de login.
  const isAuthCallback =
    pathname === "/auth/callback" ||
    pathname.startsWith("/admin/auth/callback");
  if (isAuthCallback) return NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
      return NextResponse.redirect(sameHostUrl(req, "/admin/login"));
    }
    return NextResponse.next();
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

  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] =
    null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    /* Refresh token invalid / expirat / cookie stricat. Curățăm DOAR
       cookie-urile de sesiune (`sb-...-auth-token[.N]`), NU și cele de
       PKCE (`code-verifier`) — pentru că user-ul poate fi în mijlocul
       unui login (email trimis, urmează click pe link). Ștergerea lor
       aici ar rupe fluxul PKCE. */
    for (const c of req.cookies.getAll()) {
      if (c.name.startsWith("sb-") && !c.name.includes("code-verifier")) {
        res.cookies.delete(c.name);
      }
    }
  }

  // Admin gate — doar pentru /admin/* (fără login/callback).
  const isAdminRoute =
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    !pathname.startsWith("/admin/auth/callback");

  if (isAdminRoute) {
    const role = (user?.app_metadata as { role?: string } | undefined)?.role;
    if (!user || role !== "admin") {
      // Rămânem pe hostul curent — vezi `sameHostUrl`.
      const target = `/admin/login?redirect=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(sameHostUrl(req, target));
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
