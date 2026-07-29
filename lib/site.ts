/**
 * Originea publică canonică a site-ului.
 *
 * Folosită de tot ce trebuie să emită URL-uri absolute: sitemap, JSON-LD,
 * feed-uri de produse (Merchant Center / Meta), OG images, redirect-uri Stripe.
 *
 * Ordinea de rezoluție:
 *   1. NEXT_PUBLIC_SITE_URL — singura sursă corectă în producție (domeniul real)
 *   2. VERCEL_URL — deploy-uri preview, unde domeniul e generat
 *   3. localhost — dev
 *
 * ATENȚIE: feed-urile și JSON-LD trebuie să conțină domeniul REAL. Dacă
 * NEXT_PUBLIC_SITE_URL lipsește în producție, Merchant Center va respinge
 * feed-ul (link-uri care nu se potrivesc cu domeniul verificat).
 */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000";

  return raw.replace(/\/+$/, "");
}

/** URL absolut pentru o cale relativă (`/vinuri/x` → `https://…/vinuri/x`). */
export function absUrl(path: string): string {
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * `true` cât timp site-ul e în spatele gate-ului coming-soon.
 * Când e activ: robots.txt blochează tot, ca să nu indexeze Google
 * pagina de „în curând" ca fiind homepage-ul.
 */
export function isComingSoon(): boolean {
  return process.env.COMING_SOON === "true";
}
