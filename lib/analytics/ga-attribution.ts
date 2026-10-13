import "server-only";
import { cookies } from "next/headers";

/**
 * Identificatorii GA4 ai vizitatorului, citiți la plasarea comenzii.
 *
 * Vânzarea pleacă spre GA4 și din server (webhook Stripe), unde nu mai
 * există browser. Ca GA4 s-o lege de vizita care a adus-o, are nevoie de
 * același client_id și session_id pe care le-a folosit tag-ul din pagină.
 * Le găsim în cookie-urile puse de gtag pe domeniul nostru:
 *
 *   _ga               GA1.1.1234567890.1700000000      → client_id = "1234567890.1700000000"
 *   _ga_<CONTAINER>   GS1.1.1700000000.5.1.…           → session_id = "1700000000"
 *                     GS2.1.s1700000000$o5$g1$t…       → session_id = "1700000000"
 *
 * GDPR: fără consimțământ de analiză nu citim nimic.
 */

const CONSENT_COOKIE = "locus-cookie-consent";

export type GaAttribution = {
  clientId: string | null;
  sessionId: string | null;
};

const NONE: GaAttribution = { clientId: null, sessionId: null };

function hasAnalyticsConsent(raw: string | undefined): boolean {
  if (!raw) return false;
  try {
    return (JSON.parse(raw) as { analytics?: unknown }).analytics === true;
  } catch {
    return false;
  }
}

export function parseClientId(ga: string | undefined): string | null {
  const parts = ga?.split(".");
  if (!parts || parts.length < 4) return null;
  return `${parts[2]}.${parts[3]}`;
}

export function parseSessionId(gaStream: string | undefined): string | null {
  if (!gaStream) return null;
  const gs2 = gaStream.match(/^GS2\.\d+\.s(\d+)/);
  if (gs2) return gs2[1];
  const gs1 = gaStream.match(/^GS1\.\d+\.(\d+)\./);
  return gs1 ? gs1[1] : null;
}

export async function collectGaAttribution(): Promise<GaAttribution> {
  try {
    const store = await cookies();
    if (!hasAnalyticsConsent(store.get(CONSENT_COOKIE)?.value)) return NONE;

    const measurementId = process.env.GA4_MEASUREMENT_ID ?? "";
    const streamCookie = measurementId
      ? store.get(`_ga_${measurementId.replace(/^G-/, "")}`)?.value
      : undefined;

    return {
      clientId: parseClientId(store.get("_ga")?.value),
      sessionId: parseSessionId(streamCookie),
    };
  } catch (err) {
    console.error("[ga-attribution] colectare esuata", err);
    return NONE;
  }
}
