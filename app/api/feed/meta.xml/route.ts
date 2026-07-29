import { buildFeed } from "@/lib/feed/products";

/**
 * Feed produse pentru Meta (Facebook / Instagram).
 *
 * Configurare în Commerce Manager → Catalog → Data sources → Scheduled feed:
 *   URL: https://<domeniu>/api/feed/meta.xml
 *   Frecvență: zilnic
 *
 * După import, leagă catalogul de Pixel ca să funcționeze Advantage+ catalog
 * ads și retargeting dinamic (produsul văzut → reclama cu exact acel produs).
 * `content_ids` din evenimentele pixel trebuie să fie codurile produsului
 * (LC01, LS02, …) — exact ce trimitem ca `item_id` în dataLayer.
 */

export const revalidate = 3600;

export async function GET(): Promise<Response> {
  try {
    const xml = await buildFeed("meta");

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control":
          "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    // Vezi nota din feed-ul Google: 503 în loc de feed gol, ca să nu
    // golim catalogul din Commerce Manager la o eroare temporară de DB.
    console.error("[feed/meta]", err);
    return new Response("Feed temporarily unavailable", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
