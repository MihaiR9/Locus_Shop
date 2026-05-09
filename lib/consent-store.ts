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
};

export const useConsentStore = create<ConsentStore>()((set) => ({
  hydrated: false,
  ageVerified: false,
  ageRefused: false,
  consent: null,

  hydrate: () => {
    set({
      hydrated: true,
      ageVerified: readCookie(AGE_COOKIE) === "1",
      consent: readConsentCookie(),
    });
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
  },
}));
