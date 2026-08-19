import "server-only";
import type { FgoClient, FgoContinutItem, FgoTipClient } from "./types";

/**
 * Din datele unei comenzi (row din DB + items + billing snapshot) construim
 * payload-ul (Client + Continut) pentru /factura/emitere FGO.
 *
 * Reguli:
 *  - Client: preluat din order.billing (fizica sau juridica).
 *  - Continut: fiecare `order_items` devine o linie, plus o linie pentru
 *    transport (dacă shipping_cents > 0) și o linie pentru SGR (garanție
 *    returnare, 0% TVA — nu e prestație taxabilă, e depozit restituibil).
 *  - Prețurile din DB sunt cu TVA inclus → mergem pe direcția „inversă":
 *    trimitem `PretTotal` per linie (nu `PretUnitar`) ca să nu apară
 *    rotunjiri de cenți în TVA.
 *  - CotaTVA: cota standard RO pentru vin (vezi VAT_STANDARD). SGR = 0%.
 */

type BillingSnap = Record<string, unknown>;

type OrderRow = {
  order_number: string;
  shipping_cents: number;
  sgr_cents: number;
  discount_cents: number;
  guest_email: string | null;
};

type OrderItem = {
  code_snapshot: string;
  name_snapshot: string;
  qty: number;
  unit_price_cents: number;
};

type CustomerInfo = {
  email: string | null;
  name: string | null;
  phone: string | null;
};

const VAT_STANDARD = 21; // Cota standard RO (2025+) — vin liniștit intră aici

function centsToLei(c: number): number {
  return Math.round(c) / 100;
}

function stringField(o: BillingSnap, key: string): string | undefined {
  const v = o[key];
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

export function buildFgoClient(
  billing: BillingSnap,
  customer: CustomerInfo,
): FgoClient {
  const type = (billing.type as string) === "juridica" ? "PJ" : "PF";
  const tip: FgoTipClient = type;

  if (type === "PJ") {
    // Persoană juridică
    const company = stringField(billing, "company") ?? "Firmă";
    const cui = stringField(billing, "cui");
    const regNo = stringField(billing, "reg");
    const iban = stringField(billing, "iban");
    const hq = stringField(billing, "hq") ?? "";
    const email =
      stringField(billing, "email") ?? customer.email ?? undefined;
    /* FGO cere adresa despărțită în Adresa/Localitate/Judet, așa că
       formularul de checkout le colectează separat. Comenzile de dinainte
       de despărțire au doar `hq`; pentru ele lăsăm câmpurile goale, ca FGO
       să respingă factura, în loc să inventăm un județ. O factură refuzată
       se repară dintr-un click; una emisă cu adresa greșită pleacă la ANAF
       și se corectează prin storno. */
    return {
      Denumire: company,
      CodUnic: cui,
      NrRegCom: regNo,
      Email: email,
      Telefon: customer.phone ?? undefined,
      Tara: "ROMANIA",
      Judet: stringField(billing, "hqCounty"),
      Localitate: stringField(billing, "hqCity"),
      Adresa: hq,
      Tip: tip,
      ContBancar: iban,
    };
  }

  // Persoană fizică
  const firstName = stringField(billing, "firstName") ?? "";
  const lastName = stringField(billing, "lastName") ?? "";
  const fullName = `${firstName} ${lastName}`.trim() || customer.name || "Client";
  const email = stringField(billing, "email") ?? customer.email ?? undefined;
  const cnp = stringField(billing, "cnp");
  const address = stringField(billing, "address") ?? "";
  const city = stringField(billing, "city") ?? "";
  const county = stringField(billing, "county") ?? "";

  return {
    Denumire: fullName,
    CodUnic: cnp, // opțional pentru PF
    Email: email,
    Telefon: customer.phone ?? undefined,
    Tara: "ROMANIA",
    Judet: county || "Bucuresti",
    Localitate: city,
    Adresa: address,
    Tip: tip,
  };
}

export function buildFgoContinut(args: {
  items: OrderItem[];
  order: OrderRow;
}): FgoContinutItem[] {
  const { items, order } = args;
  const lines: FgoContinutItem[] = [];

  for (const it of items) {
    const totalWithVat = centsToLei(it.unit_price_cents * it.qty);
    lines.push({
      Denumire: it.name_snapshot,
      CodArticol: it.code_snapshot,
      UM: "buc",
      NrProduse: it.qty,
      /* PretTotal include TVA — direcție inversă: FGO calculează PretUnitar
         din PretTotal / qty și scoate TVA din el. Evită rotunjiri. */
      PretTotal: totalWithVat,
      CotaTVA: VAT_STANDARD,
    });
  }

  /* Reducere voucher — linie cu cantitate negativă (per doc FGO cap. Continut).
     Se aplică proporțional peste articolele cu TVA standard; nu atinge SGR. */
  if (order.discount_cents > 0) {
    lines.push({
      Denumire: "Reducere voucher",
      CodArticol: "VOUCHER",
      UM: "buc",
      NrProduse: -1,
      PretTotal: -centsToLei(order.discount_cents),
      CotaTVA: VAT_STANDARD,
    });
  }

  // Transport
  if (order.shipping_cents > 0) {
    lines.push({
      Denumire: "Transport curier",
      CodArticol: "SHIPPING",
      UM: "buc",
      NrProduse: 1,
      PretTotal: centsToLei(order.shipping_cents),
      CotaTVA: VAT_STANDARD,
    });
  }

  // SGR — obligatoriu ANAF (RetuRO), 0% TVA (garanție, nu prestație)
  if (order.sgr_cents > 0) {
    const bottles = Math.round(order.sgr_cents / 50); // 0.5 lei/sticlă = 50 bani
    lines.push({
      Denumire: `Garanție SGR (${bottles} ambalaje)`,
      CodArticol: "SGR",
      UM: "buc",
      NrProduse: 1,
      PretTotal: centsToLei(order.sgr_cents),
      CotaTVA: 0,
    });
  }

  return lines;
}
