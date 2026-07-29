import { absUrl } from "@/lib/site";
import { abvLabel, metaLine, productPhoto, type Wine } from "@/lib/wines";

/**
 * Constructori schema.org.
 *
 * Regula de aur: ce e aici trebuie să se potrivească EXACT cu ce e în
 * feed-urile din app/api/feed/*. Google compară markup-ul de pe pagină cu
 * feed-ul din Merchant Center; preț sau disponibilitate diferite →
 * „Mismatched value" și produsele pică din Shopping/PMax.
 */

export const BRAND_NAME = "Domeniul Locus";
export const LEGAL_NAME = "SC ROMVINTEC SRL";

/** Tarif curier standard — sursa e lib/shipping.ts (sameday-standard). */
const SHIPPING_RON = 19;
const FREE_SHIPPING_FROM_RON = 250;

type JsonLdObject = Record<string, unknown>;

/** Poza principală, absolută. `null` dacă produsul nu are încă foto. */
export function wineImageUrl(wine: Wine): string | null {
  const rel = wine.heroImage ?? productPhoto(wine.code);
  if (!rel) return null;
  return rel.startsWith("http") ? rel : absUrl(rel);
}

/** Descriere text plat, folosită și în JSON-LD și în feed-uri. */
export function wineDescription(wine: Wine): string {
  const parts = [
    wine.short,
    wine.taste,
    wine.notes,
    wine.pair ? `Se potrivește cu ${wine.pair.toLowerCase()}` : "",
  ].filter((s) => s && s.trim().length > 0);

  const body = parts.join(" ");
  const spec = `${metaLine(wine)} · ${abvLabel(wine)} · gama ${wine.gama}`;

  return body ? `${body} ${spec}.` : `${wine.name} — ${spec}.`;
}

export function availabilityUrl(wine: Wine): string {
  return wine.stock > 0
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";
}

export function organizationSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Winery",
    "@id": absUrl("/#organization"),
    name: BRAND_NAME,
    legalName: LEGAL_NAME,
    url: absUrl("/"),
    logo: absUrl("/brand/logo-locus.png"),
    image: absUrl("/photos/homepage-amfora.webp"),
    description:
      "Producător de vin din Buciumeni, între Panciu și Nicorești. Vânzare directă, gamele cuvinte și semne.",
    telephone: "+40752232912",
    email: "contact@domeniul-locus.ro",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Str. Portului nr. 20, tronson 1, camera 211",
      addressLocality: "Galați",
      addressRegion: "Galați",
      addressCountry: "RO",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 45.98,
      longitude: 27.3,
    },
    areaServed: { "@type": "Country", name: "România" },
  };
}

export function websiteSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absUrl("/#website"),
    url: absUrl("/"),
    name: BRAND_NAME,
    inLanguage: "ro-RO",
    publisher: { "@id": absUrl("/#organization") },
  };
}

/**
 * Product + Offer pentru PDP.
 *
 * `shippingDetails` și `hasMerchantReturnPolicy` nu sunt obligatorii, dar
 * Google le folosește pentru rich result-ul de tip „merchant listing"
 * (afișează costul livrării direct în SERP). Le populăm din datele reale.
 */
export function productSchema(wine: Wine): JsonLdObject {
  const url = absUrl(`/vinuri/${wine.slug}`);
  const image = wineImageUrl(wine);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: `${wine.name} ${wine.code}`,
    sku: wine.code,
    mpn: wine.code,
    url,
    ...(image ? { image: [image] } : {}),
    description: wineDescription(wine),
    brand: { "@type": "Brand", name: BRAND_NAME },
    category: "Food, Beverages & Tobacco > Beverages > Alcoholic Beverages > Wine",
    ...(wine.grape ? { material: wine.grape } : {}),
    additionalProperty: [
      { "@type": "PropertyValue", name: "Gamă", value: wine.gama },
      { "@type": "PropertyValue", name: "Tip", value: wine.type },
      { "@type": "PropertyValue", name: "Dulceață", value: wine.sweetness },
      { "@type": "PropertyValue", name: "Alcool", value: `${wine.abv}% vol` },
      { "@type": "PropertyValue", name: "Volum", value: "750 ml" },
      ...(wine.year
        ? [{ "@type": "PropertyValue", name: "Recoltă", value: String(wine.year) }]
        : []),
    ],
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "RON",
      price: wine.priceRon.toFixed(2),
      availability: availabilityUrl(wine),
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": absUrl("/#organization") },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: SHIPPING_RON,
          currency: "RON",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "RO",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 3,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "RO",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnShippingFees",
        merchantReturnLink: absUrl("/retur"),
      },
    },
  };
}

/** Pragul de transport gratuit — expus ca să-l poată afișa UI-ul. */
export const FREE_SHIPPING_THRESHOLD_RON = FREE_SHIPPING_FROM_RON;

export function breadcrumbSchema(
  items: { name: string; path: string }[],
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absUrl(it.path),
    })),
  };
}

/** Listă de produse pentru paginile de colecție (/shop, /cuvinte, /semne). */
export function itemListSchema(wines: Wine[], name: string): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: wines.length,
    itemListElement: wines.map((w, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absUrl(`/vinuri/${w.slug}`),
      name: `${w.name} ${w.code}`,
    })),
  };
}
