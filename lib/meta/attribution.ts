import "server-only";
import { cookies, headers } from "next/headers";

/**
 * Culege semnalele de atribuire disponibile în momentul comenzii.
 *
 * Cookie-urile `_fbp` și `_fbc` sunt puse de pixelul Meta pe domeniul
 * nostru, deci sunt first-party și se pot citi din server. Le salvăm pe
 * comandă pentru că evenimentul CAPI pleacă mai târziu, din webhook-ul
 * Stripe, unde nu mai există browser.
 *
 * GDPR: fără consimțământ de marketing nu întoarcem nimic în afară de
 * `marketingConsent: false`. Nu are rost să stocăm IP-uri și identificatori
 * publicitari pentru evenimente pe care oricum nu avem voie să le trimitem.
 */

const CONSENT_COOKIE = "locus-cookie-consent";

export type Attribution = {
  marketingConsent: boolean;
  fbp: string | null;
  fbc: string | null;
  clientIp: string | null;
  clientUserAgent: string | null;
};

export const NO_ATTRIBUTION: Attribution = {
  marketingConsent: false,
  fbp: null,
  fbc: null,
  clientIp: null,
  clientUserAgent: null,
};

function hasMarketingConsent(raw: string | undefined): boolean {
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw) as { marketing?: unknown };
    return parsed.marketing === true;
  } catch {
    return false;
  }
}

/**
 * Primul IP din `x-forwarded-for` e cel al clientului; restul sunt
 * proxy-uri. Pe Vercel antetul e setat de infrastructură, deci e de
 * încredere. `x-real-ip` e rezerva.
 */
function readClientIp(h: Headers): string | null {
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip");
}

export async function collectAttribution(): Promise<Attribution> {
  try {
    const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);

    if (!hasMarketingConsent(cookieStore.get(CONSENT_COOKIE)?.value)) {
      return NO_ATTRIBUTION;
    }

    return {
      marketingConsent: true,
      fbp: cookieStore.get("_fbp")?.value ?? null,
      fbc: cookieStore.get("_fbc")?.value ?? null,
      clientIp: readClientIp(headerList),
      clientUserAgent: headerList.get("user-agent"),
    };
  } catch (err) {
    // Atribuirea e un bonus. Dacă citirea eșuează, comanda merge înainte.
    console.error("[attribution] colectare esuata", err);
    return NO_ATTRIBUTION;
  }
}
