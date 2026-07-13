const RO_TIME = new Intl.DateTimeFormat("ro-RO", {
  hour: "2-digit",
  minute: "2-digit",
});
const RO_DATE = new Intl.DateTimeFormat("ro-RO", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * Format Shopify-style: „Astăzi la 14:30" / „Ieri la 09:00" / „5 iul 2026".
 */
export function formatRelDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);

  if (target.getTime() === today.getTime()) {
    return `Astăzi la ${RO_TIME.format(d)}`;
  }
  if (target.getTime() === yesterday.getTime()) {
    return `Ieri la ${RO_TIME.format(d)}`;
  }
  return RO_DATE.format(d);
}
