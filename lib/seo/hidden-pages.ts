import type { Metadata } from "next";

/**
 * Pagini care funcționează pe site, dar sunt ascunse de Google până sunt gata
 * (decis cu Mihai, 10 oct 2026). Primesc `noindex` și lipsesc din sitemap.
 * Când o pagină e gata, scoate-o de aici — nimic altceva de schimbat.
 */
export const HIDDEN_FROM_SEARCH: readonly string[] = [
  "/parteneri", // oferta HoReCa nu e finalizată
  "/pauze", // gama nu are încă vinuri („în curând")
  "/social", // galeria e ascunsă până avem poze reale
];

export function isHiddenFromSearch(path: string): boolean {
  return HIDDEN_FROM_SEARCH.includes(path);
}

/** `robots` pentru metadata unei pagini: noindex dacă e în listă, altfel implicit. */
export function robotsFor(path: string): Metadata["robots"] {
  return isHiddenFromSearch(path) ? { index: false, follow: true } : undefined;
}
