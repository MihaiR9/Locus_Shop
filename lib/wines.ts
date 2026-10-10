// Types + presentation helpers. Source of truth for product data is
// now the Supabase `products` table — see lib/wines-queries.ts for
// server-side fetchers.

export type Gama = "cuvinte" | "semne" | "pauze";
export type WineType = "alb" | "rosu" | "rose";
export type Sweetness = "sec" | "demisec" | "dulce";
export type BottleColor = "white" | "red" | "rose";

export type Wine = {
  code: string;
  slug: string; // nume-gama, e.g. "feteasca-regala-cuvinte"
  name: string;
  gama: Gama;
  type: WineType;
  sweetness: Sweetness;
  abv: number;
  priceRon: number; // human-friendly RON (queries convert from price_cents)
  bottleColor: BottleColor;
  servingTemp: string;
  notes: string;
  year: number;
  stock: number; // feed availability (in_stock / out_of_stock) + JSON-LD Offer
  heroImage: string | null; // override DB pentru poza principală; null → productPhoto()
  updatedAt: string; // ISO, din products.updated_at — `lastmod` în sitemap

  // PDP-rich fields
  short: string;
  taste: string;
  pair: string;
  glass: string;
  decant: string;
  age: string;
  grape: string;
};

export function formatRon(n: number): string {
  return `${n.toLocaleString("ro-RO")} lei`;
}

/** Volumul unei sticle, în ml. Toate vinurile sunt acum la 750 ml. */
export const BOTTLE_ML = 750;

/**
 * Prețul pe litru, obligatoriu lângă prețul de vânzare pentru produse
 * vândute la volum (HG 947/2000, Directiva 98/6/CE).
 */
export function pricePerLitreLabel(priceRon: number): string {
  const perLitre = (priceRon * 1000) / BOTTLE_ML;
  return `${perLitre.toLocaleString("ro-RO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} lei / litru`;
}

const TYPE_LABEL: Record<WineType, string> = {
  alb: "Alb",
  rosu: "Roșu",
  rose: "Rosé",
};

const SWEET_LABEL: Record<Sweetness, string> = {
  sec: "Sec",
  demisec: "Demisec",
  dulce: "Dulce",
};

export function metaLine(w: Pick<Wine, "type" | "sweetness">): string {
  return `${TYPE_LABEL[w.type]} · ${SWEET_LABEL[w.sweetness]}`;
}

export function abvLabel(w: Pick<Wine, "abv">): string {
  return `${w.abv.toString().replace(".", ",")}% VOL`;
}

// Photo mapping: cuvinte are per-code shots; semne share one gama shot.
// pauze rămâne fără poză → fallback la BottleSvg.
//
// Sufixul `-nobg` nu e cosmetic: fișierele fără el aveau fundal alb, iar
// înlocuirea lor păstrând același nume lăsa browserele să servească la
// nesfârșit versiunea veche din cache (URL identic → hit de cache).
// Numele nou garantează că toată lumea primește decupajul. La fel `-v2`:
// sticlele cuvinte au fost reîncadrate la scara lui semne (1610px înălțime).
const PRODUCT_PHOTO: Record<string, string> = {
  LC01: "/photos/products/cuvinte-feteasca-regala-nobg-v2.png",
  LC02: "/photos/products/cuvinte-feteasca-neagra-nobg-v2.png",
  LC04: "/photos/products/cuvinte-riesling-italian-nobg-v2.png",
  LS01: "/photos/products/semne-nobg.png",
  LS02: "/photos/products/semne-nobg.png",
  LS04: "/photos/products/semne-nobg.png",
};

export function productPhoto(code: string): string | null {
  return PRODUCT_PHOTO[code] ?? null;
}
