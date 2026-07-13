// Formatting helpers — safe pentru client components.
// NU importa nimic din /lib/supabase/* aici (next/headers e server-only).

export function formatRon(cents: number): string {
  return `${Math.round(cents / 100).toLocaleString("ro-RO")} lei`;
}

export function formatRonPrecise(cents: number): string {
  const value = cents / 100;
  return `${value.toLocaleString("ro-RO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} lei`;
}
