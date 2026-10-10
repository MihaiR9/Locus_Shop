import "server-only";
import { cookies } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * „Ce e nou la comenzi" pentru admin: comenzile cu evenimente apărute după
 * ultima vizită în /admin/comenzi. Ultima vizită stă într-un cookie per
 * browser — suficient pentru un singur administrator, fără tabel nou.
 */
export const ORDERS_SEEN_COOKIE = "locus_admin_orders_seen";

/** Prima vizită (fără cookie): arătăm ce s-a întâmplat în ultima săptămână. */
const FIRST_VISIT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Evenimentele care merită semnalate: ce face clientul sau sistemul, plus
 * orice eroare (`*_failed`). Acțiunile adminului (AWB, marcare expediată,
 * anulare manuală) nu aprind notificarea — le-a făcut chiar el.
 */
const NOTIFY_TYPES = [
  "order_created",
  "payment_succeeded",
  "payment_failed",
  "session_expired",
  "payment_link_used",
  "payment_reminder_sent",
  "refund_webhook_ack",
];

export async function getOrdersSeenAt(): Promise<string> {
  const raw = (await cookies()).get(ORDERS_SEEN_COOKIE)?.value;
  const t = raw ? Date.parse(raw) : Number.NaN;
  return new Date(
    Number.isFinite(t) ? t : Date.now() - FIRST_VISIT_WINDOW_MS,
  ).toISOString();
}

/** ID-urile comenzilor cu activitate nouă după `since`. */
export async function getOrderIdsWithNewActivity(
  since: string,
): Promise<Set<string>> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("order_events")
    .select("order_id")
    .gt("created_at", since)
    .or(`type.in.(${NOTIFY_TYPES.join(",")}),type.like.*_failed`)
    .limit(1000);

  if (error) {
    console.error("[orders-activity]", error);
    return new Set();
  }
  return new Set((data ?? []).map((r) => r.order_id));
}
