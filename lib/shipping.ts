/**
 * Shipping — configurare curier + calcul preț client.
 *
 * Curier: **FanCourier** (contract Romvintec SRL, agenția Tecuci, actele
 * adiționale din august 2026 în /Integrari/Fancourier/).
 *
 * Servicii activate în contract:
 *   • **Standard** (colet ≤30 kg) — 24.50 lei primul kg + 2.70/kg adițional,
 *     discount comercial 25%, +TVA 21%, +index combustibil variabil lunar.
 *   • **FANbox** (colet 0-30 kg) — 14.00 lei unic, +TVA, +fuel.
 *
 * NEACTIVATE (nu emitem AWB pentru ele):
 *   • CollectPoint (PayPoint) — se scoate din UI până semnezi act adițional.
 *   • Livrare sediu FAN — la fel, act adițional separat.
 *
 * Model preț client: **preț UNIFORM național** (contractul FC nu are
 * diferențiere pe zone). Structura de zone e păstrată în cod pentru viitor
 * dacă vrei să suprataxezi rural sau să subvenționezi București.
 *
 * Pentru admin, la generarea AWB-ului, costul REAL vine din API-ul FC —
 * vezi `lib/fancourier/client.ts → getInternalTariff()`.
 */

export type ShippingMethodId =
  | "fancourier-standard"
  | "fancourier-fanbox";

/** Numele serviciului la FanCourier API — folosit la POST /intern-awb. */
export type FanCourierServiceName = "Standard" | "FANbox";

export type ShippingMethod = {
  id: ShippingMethodId;
  carrier: "FanCourier";
  fanCourierService: FanCourierServiceName;
  name: string;
  duration: string;
  description: string;
  notes: string[];
  requiresPickupPoint: boolean;
  freeShippingFromRon: number | null;
  maxCodRon: number | null;
  coverage: "all" | string[];
};

export type ShippingZoneId =
  | "bucuresti-ilfov"
  | "vecin-buciumeni"
  | "restul-tarii"
  | "rural-indepartat";

export type ShippingZone = {
  id: ShippingZoneId;
  label: string;
  counties: string[];
  durationDays: [number, number];
};

/* ─── Prețuri per (metodă × zonă) ─────────────────────────── */
/**
 * Momentan contractul FC e cu preț unic național → toate zonele au același
 * preț per metodă. Când semnezi acte adiționale cu diferențiere zonală (sau
 * vrei să subvenționezi anumite județe), editează valorile per zonă.
 *
 * Cum s-au calculat prețurile actuale (Standard 32 lei, FANbox 18 lei):
 *   • Standard: formula contract (24.50 + 2.70 × (kg-1)) × 0.75 discount ×
 *     1.21 TVA. Cu greutatea medie de 1.5 kg/sticlă și cutie ~0.5 kg,
 *     comanda tipică (2-3 sticle = 4-5 kg) iese ~27-32 lei. La 6 sticle
 *     (~9-10 kg) iese ~42 lei — pierdem ~10 lei absorbiți la comenzile mari.
 *   • FANbox: 14 lei × 1.21 TVA + fuel ~7% = ~18 lei.
 *   • Ambele au index combustibil variabil lunar în plus (~5-8%).
 */
export const ZONE_PRICES: Record<
  ShippingMethodId,
  Record<ShippingZoneId, number>
> = {
  "fancourier-standard": {
    "bucuresti-ilfov": 32,
    "vecin-buciumeni": 32,
    "restul-tarii": 32,
    "rural-indepartat": 32,
  },
  "fancourier-fanbox": {
    "bucuresti-ilfov": 18,
    "vecin-buciumeni": 18,
    "restul-tarii": 18,
    "rural-indepartat": 18,
  },
};

export const SHIPPING_ZONES: ShippingZone[] = [
  {
    id: "bucuresti-ilfov",
    label: "București + Ilfov",
    counties: ["București", "Ilfov"],
    durationDays: [1, 2],
  },
  {
    id: "vecin-buciumeni",
    label: "Județe vecine domeniului",
    counties: ["Galați", "Vrancea", "Brăila", "Buzău"],
    durationDays: [1, 2],
  },
  {
    id: "restul-tarii",
    label: "Restul țării",
    counties: [],
    durationDays: [2, 3],
  },
  {
    id: "rural-indepartat",
    label: "Localități rurale îndepărtate",
    counties: [],
    durationDays: [3, 4],
  },
];

/** Prag universal peste care livrarea e gratis (indiferent de metodă). */
export const FREE_SHIPPING_THRESHOLD_RON = 250;

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "fancourier-standard",
    carrier: "FanCourier",
    fanCourierService: "Standard",
    name: "Curier la ușă (FanCourier Standard)",
    duration: "1–3 zile lucrătoare",
    description:
      "Coletul ajunge direct la adresa pe care o introduci. Curierul te sună înainte de livrare. Acoperire în toată țara.",
    notes: [
      "Pachet standard până la 10 kg (acoperă comoda de 6 sticle 0.75 L).",
      "Plată online — coletul e deja achitat, doar semnezi la primire.",
      "Livrare sâmbăta disponibilă în orașe mari (supliment).",
    ],
    requiresPickupPoint: false,
    freeShippingFromRon: FREE_SHIPPING_THRESHOLD_RON,
    maxCodRon: null,
    coverage: "all",
  },
  {
    id: "fancourier-fanbox",
    carrier: "FanCourier",
    fanCourierService: "FANbox",
    name: "FANbox (locker 24/7)",
    duration: "1–3 zile lucrătoare",
    description:
      "Ridici coletul dintr-un locker FANbox 24/7 din apropiere. Primești cod prin SMS + email. Mai ieftin decât livrarea la ușă.",
    notes: [
      "Ridici oricând, 24 ore din 24, cu codul primit.",
      "Compartimentul L acceptă comoda de 6 sticle 0.75 L.",
      "Termen de păstrare: 48 ore de la depunere (apoi retur).",
      "Selectează lockerul dorit după completarea adresei.",
    ],
    requiresPickupPoint: true,
    freeShippingFromRon: FREE_SHIPPING_THRESHOLD_RON,
    maxCodRon: null,
    coverage: "all",
  },
];

/* ─── API ──────────────────────────────────────────────────── */

export function getShippingMethods(): ShippingMethod[] {
  return SHIPPING_METHODS;
}

export function getShippingMethod(id: ShippingMethodId): ShippingMethod | null {
  return SHIPPING_METHODS.find((m) => m.id === id) ?? null;
}

/** Preț de referință pentru afișare pe pagina /livrare. */
export function getReferencePrice(id: ShippingMethodId): number {
  return ZONE_PRICES[id]["restul-tarii"];
}

export function getZoneForCounty(county: string): ShippingZone {
  const normalized = county.trim();
  for (const zone of SHIPPING_ZONES) {
    if (zone.counties.includes(normalized)) return zone;
  }
  return SHIPPING_ZONES.find((z) => z.id === "restul-tarii") ?? SHIPPING_ZONES[2];
}

export function calculateShippingRon(args: {
  methodId: ShippingMethodId;
  county: string;
  subtotalRon: number;
}): { priceRon: number; freeApplied: boolean; zone: ShippingZone | null } {
  const method = getShippingMethod(args.methodId);
  if (!method) return { priceRon: 0, freeApplied: false, zone: null };

  const zone = getZoneForCounty(args.county);
  const base = ZONE_PRICES[method.id][zone.id] ?? 0;

  if (
    method.freeShippingFromRon !== null &&
    args.subtotalRon >= method.freeShippingFromRon
  ) {
    return { priceRon: 0, freeApplied: true, zone };
  }
  return { priceRon: base, freeApplied: false, zone };
}
