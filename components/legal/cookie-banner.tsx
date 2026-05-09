"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ACCEPT_ALL,
  NECESSARY_ONLY,
  useConsentStore,
} from "@/lib/consent-store";

/**
 * GDPR-compliant cookie banner. Shows only after age has been verified
 * and while no consent has been recorded yet (per ePrivacy Directive,
 * "X" or "Continue without choosing" must NOT count as acceptance —
 * we render no dismiss button).
 *
 * "Necesare" stays locked-on (no consent needed for strictly necessary
 * cookies under GDPR Recital 25 / ePrivacy Art. 5(3)).
 */
export function CookieBanner() {
  const hydrated = useConsentStore((s) => s.hydrated);
  const ageVerified = useConsentStore((s) => s.ageVerified);
  const consent = useConsentStore((s) => s.consent);
  const saveConsent = useConsentStore((s) => s.saveConsent);

  // Once `consent` is set the component renders nothing (early return below),
  // so the local state below only matters during the un-consented session.
  // Pre-fill from any pre-existing consent for users who reopen the banner
  // by clearing the locus-cookie-consent cookie manually.
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(consent?.analytics ?? false);
  const [marketing, setMarketing] = useState(consent?.marketing ?? false);

  if (!hydrated) return null;
  if (!ageVerified) return null;
  if (consent) return null;

  function acceptAll() {
    saveConsent(ACCEPT_ALL);
  }
  function rejectExtras() {
    saveConsent(NECESSARY_ONLY);
  }
  function saveCustom() {
    saveConsent({ necessary: true, analytics, marketing });
  }

  return (
    <aside
      className="cookie-banner"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
    >
      <div className="cookie-banner-inner">
        <div className="cookie-banner-row">
          <div className="cookie-banner-text">
            <h3 id="cookie-banner-title">Despre cookie-uri</h3>
            <p>
              Folosim cookie-uri necesare pentru funcționarea site-ului
              (autentificare, coș, preferințe). Cu acordul tău, putem folosi
              și cookie-uri de analiză și marketing pentru a înțelege cum e
              folosit site-ul. Vezi{" "}
              <Link href="/cookies">Politica de cookie-uri</Link>.
            </p>
          </div>
          <div className="cookie-banner-actions">
            <button
              type="button"
              className="cookie-btn cookie-btn-ghost"
              onClick={() => setCustomizing((v) => !v)}
              aria-expanded={customizing}
            >
              {customizing ? "Ascunde" : "Personalizează"}
            </button>
            <button
              type="button"
              className="cookie-btn cookie-btn-ghost"
              onClick={rejectExtras}
            >
              Doar necesare
            </button>
            <button
              type="button"
              className="cookie-btn cookie-btn-primary"
              onClick={acceptAll}
            >
              Accept tot
            </button>
          </div>
        </div>

        {customizing && (
          <>
            <div className="cookie-customize-grid">
              <div className="cookie-cat">
                <label className="cookie-cat-label">
                  <input type="checkbox" checked disabled aria-label="Necesare (obligatorii)" />
                  Necesare
                </label>
                <p className="cookie-cat-desc">
                  Sesiune, coș, age gate, preferințe temă. Nu pot fi dezactivate
                  — site-ul nu funcționează fără ele.
                </p>
              </div>
              <div className="cookie-cat">
                <label className="cookie-cat-label">
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                  />
                  Analitice
                </label>
                <p className="cookie-cat-desc">
                  Statistici anonime despre cum e folosit site-ul (Google
                  Analytics 4). Ne ajută să-l îmbunătățim.
                </p>
              </div>
              <div className="cookie-cat">
                <label className="cookie-cat-label">
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                  />
                  Marketing
                </label>
                <p className="cookie-cat-desc">
                  Pixel-uri de remarketing și măsurare conversii (Meta).
                  Folosit doar pentru reclame personalizate.
                </p>
              </div>
            </div>
            <div className="cookie-banner-actions" style={{ justifyContent: "flex-end" }}>
              <button
                type="button"
                className="cookie-btn cookie-btn-primary"
                onClick={saveCustom}
              >
                Salvează preferințele
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
