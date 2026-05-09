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
  priceRon: number;
  bottleColor: BottleColor;
  servingTemp: string;
  notes: string;
  year: number;

  // PDP-rich fields (ported from reference/wine.html)
  short: string;
  taste: string;
  pair: string;
  glass: string;
  decant: string;
  age: string;
  grape: string;
};

export const WINES: Wine[] = [
  {
    code: "LC01",
    slug: "feteasca-regala-cuvinte",
    name: "Fetească Regală",
    gama: "cuvinte",
    type: "alb",
    sweetness: "demisec",
    abv: 13.5,
    priceRon: 79,
    bottleColor: "white",
    servingTemp: "8–10°C",
    notes:
      "Flori albe, fructe galbene coapte, citrice fine, accente discrete de miere. Final curat, delicat.",
    year: 2025,
    short:
      "Vin elegant și armonios. Flori albe, fructe galbene coapte, citrice fine, accente discrete de miere.",
    taste:
      "Aromele de flori albe se împletesc cu note de fructe galbene coapte, citrice fine și accente discrete de miere. Textura este echilibrată, cu o prospețime bine definită și un final curat, delicat.",
    pair: "Carne albă, paste, risotto sau brânzeturi cremoase. Excelent ca aperitiv lângă crudități și pește alb la grătar.",
    glass: "pahar tip alb mediu",
    decant: "nu este nevoie",
    age: "consumă în 2–3 ani",
    grape: "Fetească Regală 100%",
  },
  {
    code: "LC02",
    slug: "feteasca-neagra-cuvinte",
    name: "Fetească Neagră",
    gama: "cuvinte",
    type: "rosu",
    sweetness: "demisec",
    abv: 14.9,
    priceRon: 89,
    bottleColor: "red",
    servingTemp: "14–16°C",
    notes:
      "Fructe negre coapte, prune uscate, accente fine de condimente. Structură catifelată, taninuri integrate.",
    year: 2025,
    short:
      "Vin intens și bine definit. Fructe negre coapte, prune uscate, accente fine de condimente. Final persistent.",
    taste:
      "Arome de fructe negre coapte, prune uscate și accente fine de condimente. Structura este amplă și catifelată, cu taninuri bine integrate și un final persistent.",
    pair: "Carne roșie, vânat, preparate condimentate sau brânzeturi maturate. Funcționează și cu mâncăruri tradiționale românești.",
    glass: "pahar Burgundia",
    decant: "20–30 min recomandat",
    age: "potențial de învechire 4–6 ani",
    grape: "Fetească Neagră 100%",
  },
  {
    code: "LC04",
    slug: "riesling-italian-cuvinte",
    name: "Riesling Italian",
    gama: "cuvinte",
    type: "alb",
    sweetness: "sec",
    abv: 13,
    priceRon: 79,
    bottleColor: "white",
    servingTemp: "8–12°C",
    notes:
      "Citrice, măr verde, accente florale discrete. Aciditate bine definită, final curat, răcoritor.",
    year: 2025,
    short:
      "Vin proaspăt și precis. Citrice, măr verde, accente florale. Aciditate susținută, final răcoritor.",
    taste:
      "Note de citrice, măr verde și accente florale discrete. Structura este susținută de o aciditate bine definită, care îi conferă tensiune și un final curat, răcoritor.",
    pair: "Preparate ușoare, pește, fructe de mare, salate sau brânzeturi fine. Excelent cu sushi și ceviche.",
    glass: "pahar tip Riesling",
    decant: "nu este nevoie",
    age: "consumă în 2–4 ani",
    grape: "Riesling Italian 100%",
  },
  {
    code: "LS01",
    slug: "feteasca-regala-semne",
    name: "Fetească Regală",
    gama: "semne",
    type: "alb",
    sweetness: "demisec",
    abv: 13.5,
    priceRon: 109,
    bottleColor: "white",
    servingTemp: "8–10°C",
    notes:
      "Flori albe, fructe coapte, miere și citrice. Textură rotundă, final delicat care invită la încă un pahar.",
    year: 2025,
    short:
      "Selecție de parcelă. Flori albe, fructe coapte, miere și citrice. Textură rotundă, final delicat care invită la încă un pahar.",
    taste:
      "Aromele de flori albe și fructe coapte se împletesc cu note subtile de miere și citrice. Textura este echilibrată, cu un gust rotund și un final delicat.",
    pair: "Carne albă, paste, risotto sau brânzeturi cremoase. Excelent cu mese de zi cu zi sau ocazii speciale.",
    glass: "pahar tip alb mediu",
    decant: "nu este nevoie",
    age: "consumă în 2–3 ani",
    grape: "Fetească Regală 100%",
  },
  {
    code: "LS02",
    slug: "feteasca-neagra-semne",
    name: "Fetească Neagră",
    gama: "semne",
    type: "rosu",
    sweetness: "demisec",
    abv: 14.9,
    priceRon: 119,
    bottleColor: "red",
    servingTemp: "14–16°C",
    notes:
      "Fructe negre coapte, prune uscate, condimente fine. Structură amplă și catifelată, final persistent.",
    year: 2025,
    short:
      "Selecție de parcelă. Fructe negre coapte, prune uscate, condimente fine. Structură amplă, taninuri integrate.",
    taste:
      "Vin intens și bine definit, cu arome de fructe negre coapte, prune uscate și accente fine de condimente. Structură amplă și catifelată cu un final persistent.",
    pair: "Carne roșie, vânat, preparate condimentate sau brânzeturi maturate. Magic lângă o tocăniță românească.",
    glass: "pahar Burgundia",
    decant: "30–40 min recomandat",
    age: "potențial de învechire 5–7 ani",
    grape: "Fetească Neagră 100%",
  },
  {
    code: "LS04",
    slug: "riesling-italian-semne",
    name: "Riesling Italian",
    gama: "semne",
    type: "alb",
    sweetness: "sec",
    abv: 13,
    priceRon: 109,
    bottleColor: "white",
    servingTemp: "8–12°C",
    notes:
      "Citrice, măr verde, accente florale. Aciditate susținută, tensiune și un final răcoritor, precis.",
    year: 2025,
    short:
      "Selecție de parcelă. Citrice, măr verde, accente florale. Aciditate susținută, tensiune precisă.",
    taste:
      "Note proaspete de citrice și măr verde, cu accente florale discrete. Aciditate bine definită care conferă tensiune și un final curat, răcoritor.",
    pair: "Preparate ușoare, pește, fructe de mare, salate sau brânzeturi fine. Excelent cu mâncare orientală.",
    glass: "pahar tip Riesling",
    decant: "nu este nevoie",
    age: "consumă în 2–4 ani",
    grape: "Riesling Italian 100%",
  },
];

export function findWineBySlug(slug: string): Wine | undefined {
  return WINES.find((w) => w.slug === slug);
}

export function relatedWines(wine: Wine, count = 3): Wine[] {
  // Same gama first, then the rest. Excludes the current wine.
  return WINES.filter((w) => w.code !== wine.code)
    .sort((a, b) => (a.gama === wine.gama ? -1 : 1) - (b.gama === wine.gama ? -1 : 1))
    .slice(0, count);
}

export function formatRon(n: number): string {
  return `${n.toLocaleString("ro-RO")} lei`;
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

export function metaLine(w: Wine): string {
  return `${TYPE_LABEL[w.type]} · ${SWEET_LABEL[w.sweetness]}`;
}

export function abvLabel(w: Wine): string {
  return `${w.abv.toString().replace(".", ",")}% VOL`;
}
