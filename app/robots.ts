import type { MetadataRoute } from "next";
import { absUrl, getSiteUrl, isComingSoon } from "@/lib/site";

// Nu cache-uim: rezultatul depinde de COMING_SOON, care se poate schimba
// fără redeploy (env var în Vercel + restart).
export const dynamic = "force-dynamic";

/**
 * robots.txt
 *
 * Cât timp COMING_SOON=true blocăm tot. Altfel Google indexează pagina
 * de „în curând" ca homepage și rămâne în index săptămâni după lansare.
 *
 * După lansare permitem tot, mai puțin zonele private și cele fără valoare
 * de indexare (checkout, cont, admin, API).
 *
 * ATENȚIE la `/api/feed/`: Merchant Center își programează fetch-ul feed-ului
 * cu Googlebot și RESPECTĂ robots.txt. Dacă blocăm `/api/` fără excepție,
 * feed-ul devine „inaccesibil" și produsele pică din Shopping. Regula `Allow`
 * mai lungă câștigă în fața `Disallow` mai scurt (specificația Google).
 */
export default function robots(): MetadataRoute.Robots {
  if (isComingSoon()) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/feed/"],
        disallow: [
          "/admin",
          "/admin/",
          "/cont",
          "/cont/",
          "/checkout",
          "/checkout/",
          "/auth/",
          "/api/",
        ],
      },
    ],
    sitemap: absUrl("/sitemap.xml"),
    host: getSiteUrl(),
  };
}
