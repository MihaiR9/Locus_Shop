import { absUrl } from "@/lib/site";
import { GAMA_META } from "@/lib/gama-meta";
import { BRAND_NAME } from "@/lib/seo/schema";
import { FREE_SHIPPING_THRESHOLD_RON, SHIPPING_METHODS } from "@/lib/shipping";
import { abvLabel, metaLine, type Wine } from "@/lib/wines";
import { getAllWinesStrict } from "@/lib/wines-queries";

// Ca sitemap-ul: o dată pe oră, ca prețurile și vinurile noi să apară singure.
export const revalidate = 3600;

/**
 * /llms.txt — rezumatul magazinului pentru asistenții AI (formatul llmstxt.org).
 * Fapte exacte, generate din catalog, ca un asistent să poată recomanda și
 * cita vinurile corect. Paginile ascunse de Google nu apar aici.
 */
export async function GET(): Promise<Response> {
  let wines: Wine[];
  try {
    wines = await getAllWinesStrict();
  } catch {
    return new Response("Temporar indisponibil.", { status: 503 });
  }

  const wineLine = (w: Wine) =>
    `- [${w.name} ${w.code}](${absUrl(`/vinuri/${w.slug}`)}): ${metaLine(w)} · ${abvLabel(w)} · ${w.priceRon} lei / 0,75 L${w.stock > 0 ? "" : " · stoc epuizat"}`;

  const byGama = (g: "cuvinte" | "semne") => wines.filter((w) => w.gama === g).map(wineLine);

  const shipping = SHIPPING_METHODS.map((m) => `- ${m.name}: ${m.duration}`).join("\n");

  const body = `# ${BRAND_NAME}

> Producător de vin din Buciumeni, județul Galați, între podgoriile Panciu și Nicorești. Vinuri cu denumire de origine controlată (DOC-CMD Panciu), vândute direct de la cramă, cu livrare în toată România. Motto: un loc. un timp. un vin.

Crama se află pe o coamă de deal, la 45.98°N 27.30°E, la întâlnirea celor două areale viticole. Vinurile sunt din soiuri românești și clasice ale zonei: Fetească Regală, Fetească Neagră, Riesling Italian.

## Gama cuvinte

${GAMA_META.cuvinte.manifesto}

${byGama("cuvinte").join("\n")}

## Gama semne

${GAMA_META.semne.manifesto}

${byGama("semne").join("\n")}

## Cumpărare

- [Toate vinurile](${absUrl("/shop")})
- [Cum cumperi](${absUrl("/cum-cumperi")}): plata cu cardul, online sau la livrare (POS-ul curierului); factură electronică.
- [Livrare](${absUrl("/livrare")}): prin FanCourier în toată România, gratuit peste ${FREE_SHIPPING_THRESHOLD_RON} lei.
${shipping}
- [Retur](${absUrl("/retur")}): drept de retragere 14 zile (OUG 34/2014), pentru sticle nedesfăcute.

## Despre

- [Povestea locului](${absUrl("/despre")})
- [Contact](${absUrl("/contact")}): office@domeniul-locus.ro · +40 752 232 912 · degustări la cramă, cu programare.

## Optional

- [Termeni și condiții](${absUrl("/termeni")})
- [Confidențialitate](${absUrl("/confidentialitate")})

Vânzare doar către persoane de peste 18 ani. Consumul excesiv de alcool dăunează sănătății.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
