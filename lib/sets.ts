/**
 * Seturi pe gamă — „cumperi toate cele trei vinuri, plătești mai puțin".
 *
 * DE CE NU E UN PRODUS SEPARAT ÎN BAZĂ:
 * garanția SGR și accizele se calculează per sticlă, iar stocul se scade
 * după codul produsului. Un set intrat în comandă ca produs unic ar
 * număra o sticlă în loc de trei — garanție greșită, stoc greșit, factură
 * greșită. Așa că setul rămâne exact ce este: trei sticle. Ce se schimbă
 * e doar prețul și felul în care le afișăm.
 *
 * REDUCEREA E CALCULATĂ DE SERVER, nu de client. Vezi
 * `app/(storefront)/checkout/actions.ts` — clientul poate afișa ce vrea,
 * banii se decid din prețurile din `products`.
 */

export const SET_DISCOUNT_PCT = 15;

export type SetDefinition = {
  key: "cuvinte" | "semne";
  /** Codurile care trebuie să fie TOATE în coș ca setul să se activeze. */
  codes: string[];
  label: string;
  /** Text scurt afișat sub titlu în coș și în sumar. */
  note: string;
};

export const SETS: SetDefinition[] = [
  {
    key: "cuvinte",
    codes: ["LC01", "LC02", "LC04"],
    label: "Set Cuvinte",
    note: "trei sticle · gama completă",
  },
  {
    key: "semne",
    codes: ["LS01", "LS02", "LS04"],
    label: "Set Semne",
    note: "trei sticle · gama completă",
  },
];

export type SetMatch = {
  def: SetDefinition;
  /** Câte seturi complete încap în coș (min. dintre cantitățile codurilor). */
  count: number;
  /** Prețul întreg al sticlelor care intră în seturi, în bani. */
  fullCents: number;
  /**
   * Reducerea acordată, în bani.
   *
   * Interfața NU o recalculează — o afișează pe asta. Prima versiune o
   * recalcula în componentă cu rotunjire pe lei, așa că lista arăta
   * „−51 lei" pentru o reducere reală de 50,55, iar rândurile nu se mai
   * adunau la total.
   */
  discountCents: number;
};

/**
 * Câte seturi complete conține coșul.
 *
 * Un set se activează doar dacă TOATE codurile lui sunt prezente. Trei
 * sticle identice nu formează un set — ideea e să încerci gama întreagă.
 * Dacă ai 2×LC01, 1×LC02, 1×LC04 → un singur set, restul rămâne la preț
 * normal.
 */
export function detectSets(
  lines: { code: string; qty: number }[],
  priceByCode: Map<string, number>,
): SetMatch[] {
  const qtyByCode = new Map<string, number>();
  for (const l of lines) {
    qtyByCode.set(l.code, (qtyByCode.get(l.code) ?? 0) + l.qty);
  }

  const found: SetMatch[] = [];
  for (const def of SETS) {
    const counts = def.codes.map((c) => qtyByCode.get(c) ?? 0);
    const complete = Math.min(...counts);
    if (complete === 0) continue;

    const perSet = def.codes.reduce(
      (sum, code) => sum + (priceByCode.get(code) ?? 0),
      0,
    );
    const fullCents = perSet * complete;

    found.push({
      def,
      count: complete,
      fullCents,
      discountCents: Math.round((fullCents * SET_DISCOUNT_PCT) / 100),
    });
  }
  return found;
}

/**
 * Reducerea totală, în bani, pentru seturile complete din coș.
 *
 * Se aplică DOAR pe sticlele care intră efectiv în seturi — o a patra
 * sticlă cumpărată separat rămâne la preț întreg. Asta e diferența față
 * de un cupon obișnuit, care ar reduce tot coșul.
 */
export function calculateSetDiscountCents(
  lines: { code: string; qty: number }[],
  priceByCode: Map<string, number>,
): { discountCents: number; matches: SetMatch[] } {
  const matches = detectSets(lines, priceByCode);
  const discountCents = matches.reduce((s, m) => s + m.discountCents, 0);
  return { discountCents, matches };
}
