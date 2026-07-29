import { buildFeed } from "@/lib/feed/products";

/**
 * Feed produse pentru Google Merchant Center.
 *
 * Configurare în Merchant Center → Products → Feeds → Scheduled fetch:
 *   URL: https://<domeniu>/api/feed/google.xml
 *   Frecvență: zilnic (prețuri și stoc se schimbă)
 *
 * Precondiții ca produsele să fie aprobate:
 *   1. Domeniul verificat și revendicat în Merchant Center
 *   2. Cont aprobat pentru vânzarea de alcool (Google cere aprobare separată
 *      + respectarea legislației locale privind vârsta)
 *   3. Pagini de livrare, retur și contact accesibile public
 */

// Feed regenerat cel mult o dată pe oră; Google oricum îl trage zilnic.
export const revalidate = 3600;

export async function GET(): Promise<Response> {
  try {
    const xml = await buildFeed("google");

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control":
          "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    // 503, NU un feed gol cu 200: Merchant Center păstrează ultima versiune
    // bună când fetch-ul eșuează, dar delistează tot dacă primește un feed
    // valid fără produse.
    console.error("[feed/google]", err);
    return new Response("Feed temporarily unavailable", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
