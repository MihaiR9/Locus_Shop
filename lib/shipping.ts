/**
 * Shipping data layer — wraps Sameday Genius API.
 *
 * Right now this returns hard-coded tariffs that match Sameday's public
 * standard list (parcel up to 5 kg). Types and shapes mirror the actual
 * API response so swapping is mechanical.
 *
 * REPLACE LATER (Faza 2):
 *   1. SAMEDAY_USERNAME / SAMEDAY_PASSWORD in `.env.local`
 *   2. POST https://api.sameday.ro/api/authenticate → token
 *   3. GET  /api/client/services            → list of services (Standard, Easybox, etc)
 *   4. GET  /api/client/services/{id}/tariff → matrix of prices by weight + counties
 *   5. Cache the result in Supabase `shipping_rates` (refresh nightly)
 *   6. Replace `getShippingOptions()` body with the cached lookup
 *
 * Docs: https://api.sameday.ro/docs/
 */

export type ShippingMethodId =
  | "sameday-standard"
  | "sameday-easybox"
  | "ridicare-locus";

export type ShippingMethod = {
  id: ShippingMethodId;
  carrier: "Sameday" | "Locus";
  name: string;
  /** durată estimată în zile lucrătoare, format human-readable */
  duration: string;
  /** preț în lei pentru pachetul standard (≤ 5 kg, ≤ 6 sticle 0.75L) */
  basePriceRon: number;
  /** prag (lei subtotal) peste care livrarea e gratuită; null = nu există prag */
  freeShippingFromRon: number | null;
  /** descriere scurtă pentru UI */
  description: string;
  /** beneficii / restricții — listate ca puncte */
  notes: string[];
  /** valoare maximă ramburs (cash on delivery) acceptată în lei */
  maxCodRon: number | null;
  /** zone unde e disponibilă; "all" = toate județele */
  coverage: "all" | string[];
};

export type ShippingZone = {
  label: string;
  counties: string[];
  durationDays: [number, number];
};

// ─── Static data — sync periodically with Sameday's public list ────────
// Last updated: 2026-05-10. Source: sameday.ro tarife standard, parcel ≤ 5 kg.

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "sameday-standard",
    carrier: "Sameday",
    name: "Curier la ușă (Sameday Standard)",
    duration: "1–3 zile lucrătoare",
    basePriceRon: 19,
    freeShippingFromRon: 250,
    description:
      "Coletul ajunge direct la adresa pe care o introduci. Curierul te sună înainte. Disponibil în toate cele 41 de județe + București.",
    notes: [
      "Pachet standard până la 5 kg (acoperă comoda 6 sticle 0.75 L).",
      "Plată ramburs (numerar sau card POS la curier) acceptată.",
      "Livrare sâmbăta în orașe mari (București, Cluj, Iași, Constanța, Timișoara) — supliment 5 lei.",
      "Localitățile rurale îndepărtate pot adăuga +1 zi lucrătoare.",
    ],
    maxCodRon: 5000,
    coverage: "all",
  },
  {
    id: "sameday-easybox",
    carrier: "Sameday",
    name: "Easybox (locker Sameday)",
    duration: "1–2 zile lucrătoare",
    basePriceRon: 14,
    freeShippingFromRon: 200,
    description:
      "Ridici coletul dintr-un Easybox 24/7 din apropiere. Primești cod prin SMS și email. Mai ieftin decât curier la ușă.",
    notes: [
      "Peste 4500 de Easybox-uri în toată țara.",
      "Compartimentul cel mai mare (L) acceptă pachetul de 6 sticle.",
      "Termen de păstrare în locker: 24 ore — după care coletul revine la depozit.",
      "Plată doar online (nu se acceptă ramburs la Easybox).",
    ],
    maxCodRon: null,
    coverage: "all",
  },
  {
    id: "ridicare-locus",
    carrier: "Locus",
    name: "Ridicare personală — Domeniul Locus",
    duration: "24–48 h pentru sediu Buciumeni · 2–4 zile pentru alte puncte",
    basePriceRon: 0,
    freeShippingFromRon: 0,
    description:
      "Ridici comanda direct de la sediul Domeniului în Buciumeni sau de la unul din punctele partenere din București, Iași și Cluj. Adu un act de identitate.",
    notes: [
      "Gratuit, indiferent de valoare.",
      "Programare prin SMS și email înainte de ridicare.",
      "Zile și ore: Lu–Vi 09:00–18:00 · Sâmbătă 10:00–14:00 (sediu Buciumeni).",
    ],
    maxCodRon: null,
    coverage: ["Galați", "București", "Iași", "Cluj"],
  },
];

export const SHIPPING_ZONES: ShippingZone[] = [
  {
    label: "București + Ilfov",
    counties: ["București", "Ilfov"],
    durationDays: [1, 2],
  },
  {
    label: "Județe vecine domeniului (Galați, Vrancea, Brăila, Buzău)",
    counties: ["Galați", "Vrancea", "Brăila", "Buzău"],
    durationDays: [1, 2],
  },
  {
    label: "Restul țării",
    counties: ["altele"],
    durationDays: [2, 3],
  },
  {
    label: "Localități rurale îndepărtate",
    counties: ["zone neacoperite zilnic"],
    durationDays: [3, 4],
  },
];

// ─── API surface (later: replace bodies with real Sameday calls) ───────

export async function getShippingOptions(): Promise<ShippingMethod[]> {
  // TODO Faza 2: înlocuiește cu fetch din Supabase shipping_rates,
  // care se actualizează zilnic dintr-un cron-job ce apelează Sameday API.
  return SHIPPING_METHODS;
}

export async function calculateShipping(args: {
  methodId: ShippingMethodId;
  subtotalRon: number;
  county?: string;
  weightKg?: number;
}): Promise<{ priceRon: number; freeApplied: boolean }> {
  const m = SHIPPING_METHODS.find((x) => x.id === args.methodId);
  if (!m) return { priceRon: 0, freeApplied: false };

  if (
    m.freeShippingFromRon !== null &&
    args.subtotalRon >= m.freeShippingFromRon
  ) {
    return { priceRon: 0, freeApplied: true };
  }
  return { priceRon: m.basePriceRon, freeApplied: false };
}

// Used by checkout summary today (synchronous fast path).
export function getBaseTariff(methodId: ShippingMethodId): number {
  return SHIPPING_METHODS.find((m) => m.id === methodId)?.basePriceRon ?? 0;
}
