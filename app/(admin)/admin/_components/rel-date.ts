// Serverele Vercel rulează în UTC: fără fus orar explicit, orele din admin
// ieșeau cu 2–3 ore în urmă și „Astăzi"/„Ieri" se decidea după ziua UTC.
const TZ = "Europe/Bucharest";

const RO_TIME = new Intl.DateTimeFormat("ro-RO", {
  timeZone: TZ,
  hour: "2-digit",
  minute: "2-digit",
});
const RO_DATE = new Intl.DateTimeFormat("ro-RO", {
  timeZone: TZ,
  day: "numeric",
  month: "short",
  year: "numeric",
});
/** Ziua calendaristică în România, ca „2026-10-10" (en-CA dă formatul ISO). */
const RO_DAY_KEY = new Intl.DateTimeFormat("en-CA", { timeZone: TZ });

/**
 * Format Shopify-style: „Astăzi la 14:30" / „Ieri la 09:00" / „5 iul 2026".
 */
export function formatRelDate(iso: string): string {
  const d = new Date(iso);
  const day = RO_DAY_KEY.format(d);
  const now = Date.now();
  const today = RO_DAY_KEY.format(now);
  const yesterday = RO_DAY_KEY.format(now - 24 * 60 * 60 * 1000);

  if (day === today) return `Astăzi la ${RO_TIME.format(d)}`;
  if (day === yesterday) return `Ieri la ${RO_TIME.format(d)}`;
  return RO_DATE.format(d);
}
