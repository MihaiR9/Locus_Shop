import "server-only";
import { absUrl, isComingSoon } from "@/lib/site";
import { getAllWinesStrict } from "@/lib/wines-queries";
import { metaLine, type Wine } from "@/lib/wines";
import { BRAND_NAME, wineDescription, wineImageUrl } from "@/lib/seo/schema";

/**
 * Feed-uri de produse pentru Google Merchant Center și Meta Commerce Manager.
 *
 * Ambele platforme consumă RSS 2.0 cu namespace-ul `g:`, dar diferă la câteva
 * valori (vezi `availability` mai jos), deci construim un model comun și
 * serializăm diferit.
 *
 * Prețul, disponibilitatea și descrierea vin din ACELEAȘI helper-e ca
 * JSON-LD-ul de pe PDP (lib/seo/schema.ts). Dacă diverg, Merchant Center
 * marchează produsele „Mismatched value" și le scoate din Shopping.
 */

/** Tarif curier standard — sursa e lib/shipping.ts (sameday-standard). */
const SHIPPING_RON = 19;

/**
 * Taxonomia Google pentru vin. Folosim calea text (acceptată oficial) în loc
 * de ID-ul numeric, ca să nu depindem de o valoare memorată greșit.
 * Dacă vrei ID: verifică în taxonomia curentă publicată de Google.
 */
const GOOGLE_PRODUCT_CATEGORY =
  "Food, Beverages & Tobacco > Beverages > Alcoholic Beverages > Wine";

export type FeedItem = {
  id: string;
  title: string;
  description: string;
  link: string;
  imageLink: string;
  price: string; // "79.00 RON"
  inStock: boolean;
  brand: string;
  mpn: string;
  productType: string;
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Colapsează spațiile și taie la limita platformei (Google: 5000 caractere). */
function clean(text: string, max = 4900): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}

function toFeedItem(wine: Wine, imageLink: string): FeedItem {
  return {
    id: wine.code,
    title: clean(`${wine.name} ${wine.code} — ${metaLine(wine)}`, 150),
    description: clean(wineDescription(wine)),
    link: absUrl(`/vinuri/${wine.slug}`),
    imageLink,
    price: `${wine.priceRon.toFixed(2)} RON`,
    inStock: wine.stock > 0,
    brand: BRAND_NAME,
    mpn: wine.code,
    productType: `Vinuri > ${wine.gama} > ${wine.name}`,
  };
}

/**
 * Produsele eligibile pentru feed.
 *
 * Excludem produsele fără imagine: `image_link` e obligatoriu la ambele
 * platforme, iar un item fără el ar fi respins individual la fiecare
 * procesare. Mai bine îl omitem controlat decât să acumulăm erori.
 */
export async function getFeedItems(): Promise<{
  items: FeedItem[];
  skipped: string[];
}> {
  // `getAllWinesStrict` aruncă dacă DB-ul e inaccesibil — vezi comentariul
  // de acolo: un feed gol servit cu 200 ar delista tot catalogul.
  const wines = await getAllWinesStrict();
  const items: FeedItem[] = [];
  const skipped: string[] = [];

  for (const wine of wines) {
    const image = wineImageUrl(wine);
    if (!image) {
      skipped.push(wine.code);
      continue;
    }
    items.push(toFeedItem(wine, image));
  }

  return { items, skipped };
}

function rssWrapper(title: string, body: string, notes: string[]): string {
  const comments = notes.map((n) => `  <!-- ${n} -->`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>${escapeXml(title)}</title>
  <link>${escapeXml(absUrl("/"))}</link>
  <description>${escapeXml("Catalog de produse Domeniul Locus")}</description>
${comments}
${body}
</channel>
</rss>
`;
}

/**
 * Feed Google Merchant Center.
 *
 * `availability` folosește underscore (`in_stock`), spre deosebire de Meta.
 * Nu trimitem GTIN pentru că nu îl avem încă în DB — Google acceptă
 * combinația brand + mpn pentru produse de marcă proprie, dar va emite un
 * avertisment. TODO: adaugă codurile EAN de pe etichete în `products`.
 */
export function buildGoogleFeed(items: FeedItem[], skipped: string[]): string {
  const body = items
    .map(
      (it) => `  <item>
    <g:id>${escapeXml(it.id)}</g:id>
    <g:title>${escapeXml(it.title)}</g:title>
    <g:description>${escapeXml(it.description)}</g:description>
    <g:link>${escapeXml(it.link)}</g:link>
    <g:image_link>${escapeXml(it.imageLink)}</g:image_link>
    <g:availability>${it.inStock ? "in_stock" : "out_of_stock"}</g:availability>
    <g:price>${escapeXml(it.price)}</g:price>
    <g:brand>${escapeXml(it.brand)}</g:brand>
    <g:mpn>${escapeXml(it.mpn)}</g:mpn>
    <g:condition>new</g:condition>
    <g:google_product_category>${escapeXml(GOOGLE_PRODUCT_CATEGORY)}</g:google_product_category>
    <g:product_type>${escapeXml(it.productType)}</g:product_type>
    <g:shipping>
      <g:country>RO</g:country>
      <g:service>Standard</g:service>
      <g:price>${SHIPPING_RON.toFixed(2)} RON</g:price>
    </g:shipping>
  </item>`,
    )
    .join("\n");

  return rssWrapper("Domeniul Locus — Google Merchant Center", body, notes(skipped));
}

/**
 * Feed Meta (Commerce Manager → catalog).
 *
 * Diferă de Google: `availability` cu spațiu (`in stock`) și fără elementul
 * `g:shipping` structurat. Restul câmpurilor sunt compatibile.
 *
 * NOTĂ politică: Meta permite catalog + reclame pentru alcool, dar NU
 * checkout on-platform, iar campaniile trebuie restricționate 18+ (21+ în
 * unele piețe). Se configurează în Ads Manager, nu în feed.
 */
export function buildMetaFeed(items: FeedItem[], skipped: string[]): string {
  const body = items
    .map(
      (it) => `  <item>
    <g:id>${escapeXml(it.id)}</g:id>
    <g:title>${escapeXml(it.title)}</g:title>
    <g:description>${escapeXml(it.description)}</g:description>
    <g:link>${escapeXml(it.link)}</g:link>
    <g:image_link>${escapeXml(it.imageLink)}</g:image_link>
    <g:availability>${it.inStock ? "in stock" : "out of stock"}</g:availability>
    <g:price>${escapeXml(it.price)}</g:price>
    <g:brand>${escapeXml(it.brand)}</g:brand>
    <g:condition>new</g:condition>
    <g:product_type>${escapeXml(it.productType)}</g:product_type>
  </item>`,
    )
    .join("\n");

  return rssWrapper("Domeniul Locus — Meta catalog", body, notes(skipped));
}

function notes(skipped: string[]): string[] {
  const out: string[] = [];
  if (isComingSoon()) {
    out.push(
      "COMING_SOON=true — feed servit gol intentionat: link-urile ar duce la pagina de asteptare si platformele ar marca produsele ca inaccesibile.",
    );
  }
  if (skipped.length > 0) {
    out.push(`Produse excluse (fara imagine): ${skipped.join(", ")}`);
  }
  return out;
}

/** Sursa unică pentru ambele route handlers. */
export async function buildFeed(
  platform: "google" | "meta",
): Promise<string> {
  // Cât timp site-ul e în spatele coming-soon, servim un feed valid dar gol.
  // Altfel Merchant Center crawlează link-uri care redirectează la pagina de
  // așteptare și marchează contul cu erori greu de curățat ulterior.
  if (isComingSoon()) {
    return platform === "google"
      ? buildGoogleFeed([], [])
      : buildMetaFeed([], []);
  }

  const { items, skipped } = await getFeedItems();
  return platform === "google"
    ? buildGoogleFeed(items, skipped)
    : buildMetaFeed(items, skipped);
}
