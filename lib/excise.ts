/**
 * Accize (excise duty) pentru vin liniștit — Legea 227/2015 art. 342.
 *
 * Cota (2026): **11 lei / 100 L** de vin liniștit necarbogazos.
 * Vinurile spumante au cotă diferită — de tratat separat când vom vinde.
 *
 * Ca legislație: accizele sunt INCLUSE în prețul afișat consumatorului
 * (nu se adaugă la checkout, spre deosebire de SGR care e vizibil).
 * Trebuie însă defalcate pe FACTURA fiscală → salvăm suma calculată pe
 * comandă în `orders.excise_cents` ca s-o punem în factura FGO/Smartbill.
 *
 * Volum standard sticlă: 750 ml. Dacă în viitor vindem magnums (1.5L)
 * sau half-bottles (375ml), extindem cu volum per-variant.
 */

/** Cota accize vin liniștit, lei / 100L (2026). */
export const EXCISE_PER_HL_RON = 11;

/** Volum standard sticlă (ml). */
export const DEFAULT_BOTTLE_ML = 750;

/**
 * Calculează accizele pentru un număr de sticle de volum standard.
 * Returnează suma în lei (poate avea zecimale).
 *
 * Ex: 6 sticle × 750 ml = 4.5 L → 11 * 4.5 / 100 = 0.495 lei
 */
export function calculateExciseRon(
  totalBottles: number,
  bottleMl: number = DEFAULT_BOTTLE_ML,
): number {
  const totalLiters = (totalBottles * bottleMl) / 1000;
  return (totalLiters * EXCISE_PER_HL_RON) / 100;
}

/** Ca `calculateExciseRon` dar returnează bani (integer). */
export function calculateExciseCents(
  totalBottles: number,
  bottleMl: number = DEFAULT_BOTTLE_ML,
): number {
  return Math.round(calculateExciseRon(totalBottles, bottleMl) * 100);
}
