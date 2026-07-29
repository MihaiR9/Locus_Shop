import "server-only";
import { createHash } from "node:crypto";

/**
 * Meta Conversions API — trimiterea conversiilor din server.
 *
 * DE CE: pixelul din browser pierde 20–40% din conversii — ad-blockere,
 * Safari/iOS care taie cookie-urile, extensii de confidențialitate. Meta
 * optimizează licitațiile pe baza conversiilor pe care le VEDE, deci ce nu
 * ajunge la ea îți scumpește reclama. CAPI trimite același eveniment din
 * webhook-ul Stripe, unde nu poate fi blocat.
 *
 * DEDUPLICARE: evenimentul de aici și cel al pixelului din browser au
 * ACELAȘI `event_id` (numărul comenzii) și același `event_name`. Meta le
 * unește și numără o singură conversie. Dacă `event_id` lipsește dintr-o
 * parte, conversiile se dublează și toate rapoartele mint.
 * În GTM, tag-ul Meta Pixel trebuie configurat cu `eventID` citit din
 * `ecommerce.event_id` — vezi docs/ANALYTICS.md.
 *
 * GDPR: apelantul e responsabil să trimită doar cu consimțământ de
 * marketing. Vezi `orders.marketing_consent` (migrarea 0014).
 */

// Versiunea Graph API. Meta scoate din uz versiunile după ~2 ani, așa că
// e configurabilă. VERIFICĂ versiunea curentă în changelog-ul Meta la
// prima configurare și setează META_GRAPH_API_VERSION dacă e mai nouă.
const DEFAULT_GRAPH_VERSION = "v21.0";

export type CapiItem = {
  code: string;
  qty: number;
  unitPriceRon: number;
};

export type CapiUser = {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  city?: string | null;
  zip?: string | null;
  countryCode?: string | null; // ISO-2, ex "RO"
  clientIp?: string | null;
  userAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
};

export type SendPurchaseArgs = {
  /** Numărul comenzii. Cheia de deduplicare cu pixelul din browser. */
  eventId: string;
  /** Valoarea comenzii în RON (nu bani). */
  valueRon: number;
  items: CapiItem[];
  user: CapiUser;
  /** URL-ul paginii pe care s-a produs conversia. */
  sourceUrl: string;
  /** Momentul plății. Meta acceptă evenimente vechi de cel mult 7 zile. */
  eventTime?: Date;
};

export type CapiResult =
  | { sent: true; eventsReceived: number }
  | { sent: false; reason: "not_configured" }
  | { sent: false; reason: "error"; message: string };

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

/** Meta cere text normalizat ÎNAINTE de hash, altfel potrivirea eșuează. */
function hashText(value: string | null | undefined): string[] | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  return [sha256(normalized)];
}

// Semnele diacritice pe care le separă normalizarea NFD (ă → a + ˘).
// Scris ca escape ASCII, nu ca literale: caracterele combinante sunt
// invizibile în editor și se pot pierde la conversii de encoding.
const NFD_MARKS = new RegExp("[\\u0300-\\u036f]", "g");

/** Nume și oraș: fără diacritice, punctuație sau spații. */
function hashName(value: string | null | undefined): string[] | undefined {
  if (!value) return undefined;
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(NFD_MARKS, "")
    .replace(/[^a-z]/g, "");
  if (!normalized) return undefined;
  return [sha256(normalized)];
}

/**
 * Telefon în format internațional, doar cifre, fără `+`.
 * Numerele românești locale (07…) primesc prefixul de țară 40.
 */
function hashPhone(value: string | null | undefined): string[] | undefined {
  if (!value) return undefined;
  let digits = value.replace(/\D/g, "");
  if (!digits) return undefined;
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith("0")) {
    digits = `40${digits.slice(1)}`;
  } else if (digits.length === 9 && digits.startsWith("7")) {
    digits = `40${digits}`;
  }
  return [sha256(digits)];
}

function buildUserData(user: CapiUser): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  const em = hashText(user.email);
  if (em) data.em = em;
  const ph = hashPhone(user.phone);
  if (ph) data.ph = ph;
  const fn = hashName(user.firstName);
  if (fn) data.fn = fn;
  const ln = hashName(user.lastName);
  if (ln) data.ln = ln;
  const ct = hashName(user.city);
  if (ct) data.ct = ct;
  const zp = hashText(user.zip?.replace(/\s/g, ""));
  if (zp) data.zp = zp;
  const country = hashText(user.countryCode);
  if (country) data.country = country;

  // Astea NU se hashuiesc — Meta le vrea în clar.
  if (user.clientIp) data.client_ip_address = user.clientIp;
  if (user.userAgent) data.client_user_agent = user.userAgent;
  if (user.fbp) data.fbp = user.fbp;
  if (user.fbc) data.fbc = user.fbc;

  return data;
}

/**
 * Trimite evenimentul `Purchase`.
 *
 * Nu aruncă niciodată: o eroare de la Meta nu are voie să rupă procesarea
 * webhook-ului Stripe, unde comanda e deja plătită. Apelantul decide ce
 * face cu rezultatul (noi îl scriem în `order_events`).
 */
export async function sendPurchaseEvent(
  args: SendPurchaseArgs,
): Promise<CapiResult> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

  // Lipsa configurării nu e o eroare: până marketing-ul creează tokenul,
  // restul fluxului trebuie să meargă normal.
  if (!pixelId || !accessToken) {
    return { sent: false, reason: "not_configured" };
  }

  const version = process.env.META_GRAPH_API_VERSION || DEFAULT_GRAPH_VERSION;
  const testCode = process.env.META_TEST_EVENT_CODE;

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor((args.eventTime ?? new Date()).getTime() / 1000),
        event_id: args.eventId,
        event_source_url: args.sourceUrl,
        action_source: "website",
        user_data: buildUserData(args.user),
        custom_data: {
          currency: "RON",
          value: args.valueRon,
          order_id: args.eventId,
          content_type: "product",
          content_ids: args.items.map((i) => i.code),
          contents: args.items.map((i) => ({
            id: i.code,
            quantity: i.qty,
            item_price: i.unitPriceRon,
          })),
          num_items: args.items.reduce((s, i) => s + i.qty, 0),
        },
      },
    ],
    // Prezent doar în testare: face evenimentele vizibile în
    // Events Manager → Test Events, fără să polueze datele reale.
    ...(testCode ? { test_event_code: testCode } : {}),
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${version}/${pixelId}/events`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
        // Webhook-ul Stripe are timeout propriu; nu-l ținem blocat dacă
        // Meta nu răspunde.
        signal: AbortSignal.timeout(8000),
      },
    );

    const body = (await res.json().catch(() => null)) as
      | { events_received?: number; error?: { message?: string } }
      | null;

    if (!res.ok) {
      const message =
        body?.error?.message ?? `HTTP ${res.status} ${res.statusText}`;
      console.error("[meta-capi] Purchase respins", args.eventId, message);
      return { sent: false, reason: "error", message };
    }

    return { sent: true, eventsReceived: body?.events_received ?? 0 };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[meta-capi] Purchase a esuat", args.eventId, message);
    return { sent: false, reason: "error", message };
  }
}
