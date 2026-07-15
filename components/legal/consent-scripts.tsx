"use client";

import { useEffect } from "react";
import { useConsentStore } from "@/lib/consent-store";

/**
 * Bootstrap Consent Mode v2 la hidratarea consent store-ului.
 *
 * Anterior injecta direct tag-urile GA4 + Meta Pixel. Acum GTM
 * (GTM-5TNDPL7Z, instalat în app/layout.tsx) gestionează toate tag-urile
 * — marketing-ul le adaugă din UI-ul GTM. Rolul acestui component e doar
 * să trigger-uiască `hydrate()` din consent-store, care la rândul lui
 * face push `gtag('consent', 'update', ...)` cu starea salvată în cookie.
 *
 * Fără acest bootstrap, GTM ar rămâne blocat pe defaults (all denied)
 * chiar dacă user-ul a acceptat cookies într-o sesiune anterioară.
 */
export function ConsentScripts() {
  const hydrate = useConsentStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return null;
}
