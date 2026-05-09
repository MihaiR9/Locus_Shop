export type Gama = "cuvinte" | "semne" | "pauze";
export type WineType = "alb" | "rosu" | "rose";
export type Sweetness = "sec" | "demisec" | "dulce";
export type BottleColor = "white" | "red" | "rose";

export type Wine = {
  code: string;
  slug: string;
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
};

export const WINES: Wine[] = [
  {
    code: "LC01",
    slug: "lc01-feteasca-regala",
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
  },
  {
    code: "LC02",
    slug: "lc02-feteasca-neagra",
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
  },
  {
    code: "LC04",
    slug: "lc04-riesling-italian",
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
  },
  {
    code: "LS01",
    slug: "ls01-feteasca-regala",
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
  },
  {
    code: "LS02",
    slug: "ls02-feteasca-neagra",
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
  },
  {
    code: "LS04",
    slug: "ls04-riesling-italian",
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
  },
];

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
