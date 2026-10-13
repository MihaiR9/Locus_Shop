import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildPurchasePayload } from "@/lib/analytics/purchase";

/**
 * Trimite evenimente GA4 din server, prin Measurement Protocol.
 *
 * DE CE: `purchase` din pagina de succes se pierde când clientul plătește
 * pe Stripe și închide fereastra înainte să revină pe site. Webhook-ul
 * Stripe trimite aceeași vânzare din server. Ambele au același
 * `transaction_id` (numărul comenzii), iar GA4 păstrează un singur
 * `purchase` per tranzacție.
 *
 * Fără `ga_client_id` pe comandă (vizitatorul n-a acceptat cookie-urile de
 * analiză) nu trimitem nimic: GA4 nu acceptă evenimente fără client_id, iar
 * fără consimțământ n-avem voie să-l inventăm.
 *
 * Nu aruncă niciodată — GA4 indisponibil nu afectează o comandă.
 */

const ENDPOINT = "https://www.google-analytics.com/mp/collect";

type Ga4Event = { name: string; params: Record<string, unknown> };

export type Ga4Result =
  | { sent: true }
  | { sent: false; reason: "not_configured" | "no_client_id" | "no_order" | "error"; message?: string };

async function send(
  clientId: string,
  sessionId: string | null,
  event: Ga4Event,
): Promise<Ga4Result> {
  const measurementId = process.env.GA4_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;
  if (!measurementId || !apiSecret) return { sent: false, reason: "not_configured" };

  const url = `${ENDPOINT}?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        events: [
          {
            name: event.name,
            params: {
              ...event.params,
              // Fără ele, GA4 pune evenimentul într-o sesiune nouă, fără sursă.
              ...(sessionId ? { session_id: sessionId } : {}),
              engagement_time_msec: 1,
            },
          },
        ],
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return { sent: false, reason: "error", message: `HTTP ${res.status}` };
    }
    return { sent: true };
  } catch (err) {
    return {
      sent: false,
      reason: "error",
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

async function loadIds(orderId: string) {
  const { data } = await getSupabaseAdminClient()
    .from("orders")
    .select("order_number, ga_client_id, ga_session_id")
    .eq("id", orderId)
    .maybeSingle();
  return data;
}

/** Scrie rezultatul în istoricul comenzii, doar când chiar s-a încercat. */
async function record(orderId: string, name: string, result: Ga4Result) {
  if (!result.sent && result.reason !== "error") return;
  await getSupabaseAdminClient()
    .from("order_events")
    .insert({
      order_id: orderId,
      type: result.sent ? `ga4_${name}_sent` : `ga4_${name}_failed`,
      payload: result.sent ? {} : { error: result.message ?? "unknown" },
    });
}

export async function sendGa4Purchase(orderId: string): Promise<Ga4Result> {
  const ids = await loadIds(orderId);
  if (!ids) return { sent: false, reason: "no_order" };
  if (!ids.ga_client_id) return { sent: false, reason: "no_client_id" };

  const purchase = await buildPurchasePayload(orderId);
  if (!purchase) return { sent: false, reason: "no_order" };

  const result = await send(ids.ga_client_id, ids.ga_session_id, {
    name: "purchase",
    params: {
      transaction_id: purchase.transactionId,
      currency: "RON",
      value: purchase.value,
      tax: purchase.tax,
      shipping: purchase.shipping,
      ...(purchase.coupon ? { coupon: purchase.coupon } : {}),
      items: purchase.items,
    },
  });
  await record(orderId, "purchase", result);
  return result;
}

/**
 * Anulează integral o vânzare deja raportată: rambursare completă sau o
 * comandă cu plata la livrare refuzată. GA4 o scade din venituri.
 */
export async function sendGa4Refund(orderId: string): Promise<Ga4Result> {
  const ids = await loadIds(orderId);
  if (!ids) return { sent: false, reason: "no_order" };
  if (!ids.ga_client_id) return { sent: false, reason: "no_client_id" };

  const purchase = await buildPurchasePayload(orderId);
  if (!purchase) return { sent: false, reason: "no_order" };

  const result = await send(ids.ga_client_id, ids.ga_session_id, {
    name: "refund",
    params: {
      transaction_id: purchase.transactionId,
      currency: "RON",
      value: purchase.value,
    },
  });
  await record(orderId, "refund", result);
  return result;
}
