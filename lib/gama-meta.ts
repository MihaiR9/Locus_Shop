import type { Gama } from "@/lib/wines";

export type GamaPillar = {
  word: string;
  body: string;
};

export type GamaMeta = {
  title: string; // shown in hero (Italiana display size)
  manifesto: string; // single paragraph under hero
  pillars: [GamaPillar, GamaPillar, GamaPillar];
};

/**
 * Brand-voice copy per gamă. Tone: short sentences, contemplative,
 * avoids marketing language and exclamations. Voice keywords from
 * CLAUDE.md §1: origine, timp, măsură, locul, parcurs, mărturie.
 */
export const GAMA_META: Record<Gama, GamaMeta> = {
  cuvinte: {
    title: "cuvinte",
    manifesto:
      "Eticheta minimalistă, tipografică. Vinul vorbește singur — un cod, un soi, un an. Restul se află în pahar.",
    pillars: [
      {
        word: "minimalism",
        body: "Spațiu alb, ritm calm. Decizia de a tăia ce nu e nevoie. Tot ce rămâne contează.",
      },
      {
        word: "tipografie",
        body: "Caracterele poartă atenția. O linie, un cod, un nume. Eticheta ca declarație, nu ca decor.",
      },
      {
        word: "sinceritate",
        body: "Fără retușări, fără promisiuni mari. Vinul livrat curat, așa cum e — locul vorbește.",
      },
    ],
  },
  semne: {
    title: "semne",
    manifesto:
      "Locul devine semn. Eticheta poartă coordonate, relief, simboluri. Vinul vorbește prin formă, dincolo de cuvinte.",
    pillars: [
      {
        word: "simbol",
        body: "Stea, hartă, coordonate. Locul așezat în formă. Fiecare semn cere recunoaștere, nu explicație.",
      },
      {
        word: "ritual",
        body: "O sticlă deschisă lent. Servită la temperatură. Ascultată cu atenție — cum stă, nu cum sună.",
      },
      {
        word: "formă",
        body: "Geometria etichetei urmărește relieful. Linii care imită drumul apei prin pământ.",
      },
    ],
  },
  pauze: {
    title: "pauze",
    manifesto:
      "Momentul când vinul tace și asculți. Loturi mici, ediții limitate, sticle păstrate dincolo de recolta lor.",
    pillars: [
      {
        word: "rezervă",
        body: "Sticle puse deoparte. Anii care le adaugă caracter, nu le iau prospețime.",
      },
      {
        word: "timp",
        body: "Răbdarea ca ingredient. Vinul așteaptă singur să-și găsească echilibrul.",
      },
      {
        word: "eveniment",
        body: "Loturi mici. Câte una pentru fiecare moment care merită oprit din parcurs.",
      },
    ],
  },
};

export const ALL_GAMA: Gama[] = ["cuvinte", "semne", "pauze"];
