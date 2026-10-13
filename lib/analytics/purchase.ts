import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { VAT_STANDARD } from "@/lib/fgo/build-invoice";
import { TYPE_LABEL, type WineType } from "@/lib/wines";
import type { GtmItem } from "@/lib/analytics/gtm";

const BRAND = "Domeniul Locus";

/**
 * Vânzarea, în forma pe care o trimitem la GA4 (din pagină și din server)
 * și la Meta. Un singur loc, ca platformele să raporteze aceleași cifre.
 *
 * `value` = vinurile după reducere, cu TVA. Fără transport (îl dăm mai
 * departe la curier) și fără SGR (garanție, se returnează) — altfel
 * rapoartele de reclame ar număra ca vânzare bani care nu sunt vânzare.
 * Transportul și TVA-ul pleacă separat, în `shipping` și `tax`.
 */
export type PurchasePayload = {
  transactionId: string;
  value: number;
  tax: number;
  shipping: number;
  coupon?: string;
  items: GtmItem[];
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/** TVA-ul inclus în prețuri. SGR-ul nu are TVA, deci nu intră. */
function includedVat(grossRon: number): number {
  return round2((grossRon * VAT_STANDARD) / (100 + VAT_STANDARD));
}

export async function buildPurchasePayload(
  orderId: string,
): Promise<PurchasePayload | null> {
  const supabase = getSupabaseAdminClient();

  const [{ data: order }, { data: lines }] = await Promise.all([
    supabase
      .from("orders")
      .select("order_number, subtotal_cents, discount_cents, shipping_cents, coupon_code")
      .eq("id", orderId)
      .maybeSingle(),
    supabase
      .from("order_items")
      .select("code_snapshot, name_snapshot, qty, unit_price_cents")
      .eq("order_id", orderId),
  ]);
  if (!order || !lines?.length) return null;

  const { data: products } = await supabase
    .from("products")
    .select("code, gama, type, year")
    .in(
      "code",
      lines.map((l) => l.code_snapshot),
    );
  const byCode = new Map((products ?? []).map((p) => [p.code, p]));

  const value = (order.subtotal_cents - order.discount_cents) / 100;
  const shipping = order.shipping_cents / 100;

  return {
    transactionId: order.order_number,
    value: round2(value),
    tax: includedVat(value + shipping),
    shipping: round2(shipping),
    ...(order.coupon_code ? { coupon: order.coupon_code } : {}),
    items: lines.map((l, index) => {
      const p = byCode.get(l.code_snapshot);
      return {
        item_id: l.code_snapshot,
        item_name: l.name_snapshot,
        item_brand: BRAND,
        ...(p?.gama ? { item_category: p.gama } : {}),
        ...(p?.type ? { item_category2: TYPE_LABEL[p.type as WineType] } : {}),
        ...(p?.year ? { item_variant: String(p.year) } : {}),
        index,
        price: l.unit_price_cents / 100,
        quantity: l.qty,
      };
    }),
  };
}
