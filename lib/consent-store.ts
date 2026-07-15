import { create } from "zustand";
import {
  readCookie,
  writeCookie,
  SIX_MONTHS,
  THIRTY_DAYS,
} from "@/lib/cookies";

// ─── Age verification ───────────────────────────────────────────────
const AGE_COOKIE = "locus-age-verified";
const AGE_AUDIT_KEY = "locus-age-audit";

type AgeAuditEntry = { ts: number; ua: string };

function pushAuditEntry() {
  try {
    const raw = localStorage.getItem(AGE_AUDIT_KEY);
    const list: AgeAuditEntry[] = raw ? JSON.parse(raw) : [];
    list.push({ ts: Date.now(), ua: navigator.userAgent });
    // Cap at 25 entries — anything older is irrelevant for our purposes.
    const trimmed = list.slice(-25);
    localStorage.setItem(AGE_AUDIT_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore — local audit is best-effort; real GDPR audit must live server-side
  }
}

// ─── Google Consent Mode v2 ─────────────────────────────────────────
// Sincronizează starea de consent cu GTM. Trimite `gtag('consent', 'update', ...)`
// când utilizatorul acceptă / respinge categorii în banner. GTM ascultă
// aceste evenimente și pornește / oprește tag-urile respective (GA4, Ads, Pixel).
//
// Dacă `analytics_storage` e denied → GA4 folosește "cookieless pings" în UE
// (agregate anonime, fără cookie). Dacă `ad_*_storage` sunt denied → Ads
// nu folosește nici un cookie de personalizare.
function pushConsentUpdate(analytics: boolean, marketing: boolean) {
  if (typeof window === "undefined") return;
  const w = window as unknown as {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  };
  const gtag =
    w.gtag ??
    ((...args: unknown[]) => {
      w.dataLayer = w.dataLayer ?? [];
      w.dataLayer.push(args);
    });
  gtag("consent", "update", {
    analytics_storage: analytics ? "granted" : "denied",
    ad_storage: marketing ? "granted" : "denied",
    ad_user_data: marketing ? "granted" : "denied",
    ad_personalization: marketing ? "granted" : "denied",
  });
}

// ─── Cookie consent ─────────────────────────────────────────────────
const CONSENT_COOKIE = "locus-cookie-consent";

export type Consent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  ts: number;
};

export const NECESSARY_ONLY: Omit<Consent, "ts"> = {
  necessary: true,
  analytics: false,
  marketing: false,
};
export const ACCEPT_ALL: Omit<Consent, "ts"> = {
  necessary: true,
  analytics: true,
  marketing: true,
};

function readConsentCookie(): Consent | null {
  const raw = readCookie(CONSENT_COOKIE);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      parsed.necessary === true &&
      typeof parsed.analytics === "boolean" &&
      typeof parsed.marketing === "boolean" &&
      typeof parsed.ts === "number"
    ) {
      return parsed as Consent;
    }
  } catch {}
  return null;
}

// ─── Store ──────────────────────────────────────────────────────────
type ConsentStore = {
  hydrated: boolean;
  ageVerified: boolean;
  ageRefused: boolean;
  consent: Consent | null;

  hydrate: () => void;
  verifyAge: () => void;
  refuseAge: () => void;
  saveConsent: (next: Omit<Consent, "ts">) => void;
  resetConsent: () => void;
};

export const useConsentStore = create<ConsentStore>()((set) => ({
  hydrated: false,
  ageVerified: false,
  ageRefused: false,
  consent: null,

  hydrate: () => {
    const consent = readConsentCookie();
    set({
      hydrated: true,
      ageVerified: readCookie(AGE_COOKIE) === "1",
      consent,
    });
    // Rehidratează Consent Mode v2 la fiecare load ca GTM să știe starea
    // actualizată (default e denied — dacă user a acceptat înainte,
    // trebuie să reafirmăm în noua sesiune de pagină).
    if (consent) pushConsentUpdate(consent.analytics, consent.marketing);
  },

  verifyAge: () => {
    writeCookie(AGE_COOKIE, "1", THIRTY_DAYS);
    pushAuditEntry();
    set({ ageVerified: true, ageRefused: false });
  },

  refuseAge: () => {
    set({ ageRefused: true });
  },

  saveConsent: (next) => {
    const full: Consent = { ...next, ts: Date.now() };
    writeCookie(CONSENT_COOKIE, JSON.stringify(full), SIX_MONTHS);
    set({ consent: full });
    // Sincronizează imediat cu GTM (Consent Mode v2).
    pushConsentUpdate(next.analytics, next.marketing);
  },

  // Pentru buton „Modifică preferințe" pe /cookies — șterge cookie-ul
  // de consent, banner-ul reapare. Consent Mode revine implicit la denied.
  resetConsent: () => {
    writeCookie(CONSENT_COOKIE, "", -1);
    set({ consent: null });
    pushConsentUpdate(false, false);
  },
}));
