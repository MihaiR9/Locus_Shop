"use client";

import { useState } from "react";
import { useConsentStore } from "@/lib/consent-store";

/**
 * Buton pentru resetarea consent-ului cookie — șterge cookie-ul
 * `locus-cookie-consent`, banner-ul reapare imediat, GTM revine la
 * defaults (all denied). GDPR: user trebuie să-și poată revoca
 * consent-ul la fel de ușor cum l-a dat (Art. 7(3)).
 */
export function ResetConsentButton() {
  const consent = useConsentStore((s) => s.consent);
  const resetConsent = useConsentStore((s) => s.resetConsent);
  const [flashed, setFlashed] = useState(false);

  function handleClick() {
    resetConsent();
    setFlashed(true);
    setTimeout(() => setFlashed(false), 2500);
  }

  const label = consent
    ? consent.analytics && consent.marketing
      ? "Accepți toate cookie-urile"
      : consent.analytics || consent.marketing
        ? "Ai preferințe parțiale"
        : "Doar cookie-uri necesare"
    : "Nu ai preferințe salvate";

  return (
    <div className="cookie-reset">
      <p className="cookie-reset-status">
        <strong>Preferințele tale actuale:</strong> {label}
      </p>
      <button
        type="button"
        onClick={handleClick}
        className="cookie-reset-btn"
      >
        {flashed ? "✓ Preferințe resetate" : "Modifică preferințele cookie"}
      </button>
      {flashed && (
        <p className="cookie-reset-hint">
          Banner-ul va reapărea în câteva secunde. Alege noile preferințe.
        </p>
      )}
    </div>
  );
}
