/**
 * SGR — Sistemul Garanție-Returnare.
 *
 * Obligație legală (OUG 197/2020) pentru toate băuturile în ambalaje SGR
 * (sticle 0.1 - 3 L). Client plătește 0.5 lei/ambalaj la achiziție. Sticla
 * e recuperabilă la orice punct de colectare — se restituie garanția.
 *
 * Trebuie afișat SEPARAT pe comandă și pe factură (nu ascuns în preț),
 * altfel comerciantul e amendabil de RetuRO.
 *
 * SGR e o garanție, NU e preț de produs → nu se aplică TVA la SGR și nu
 * intră în baza de calcul a discount-urilor / voucher-elor.
 */

/** Cuantumul garanției SGR per unitate (RON). */
export const SGR_PER_BOTTLE_RON = 0.5;

export function calculateSgrRon(totalBottles: number): number {
  return Math.max(0, totalBottles) * SGR_PER_BOTTLE_RON;
}

/** Numărul total de sticle dintr-un coș/comandă. */
export function countBottles(items: Array<{ qty: number }>): number {
  return items.reduce((sum, it) => sum + it.qty, 0);
}
