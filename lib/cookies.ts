/**
 * Tiny client-side cookie helpers. SameSite=Lax + path=/ by default —
 * good for first-party persistence across same-site navigation while
 * blocking cross-site scenarios. We never set Secure here so localhost
 * dev keeps working; prod will set it via the domain config.
 */

export function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const target = `${name}=`;
  for (const part of document.cookie.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(target)) {
      return decodeURIComponent(trimmed.slice(target.length));
    }
  }
  return null;
}

export function writeCookie(
  name: string,
  value: string,
  maxAgeSeconds: number,
): void {
  if (typeof document === "undefined") return;
  const v = encodeURIComponent(value);
  document.cookie = `${name}=${v}; max-age=${maxAgeSeconds}; path=/; samesite=lax`;
}

export function clearCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; max-age=0; path=/; samesite=lax`;
}

// Common durations
export const ONE_DAY = 60 * 60 * 24;
export const THIRTY_DAYS = ONE_DAY * 30;
export const SIX_MONTHS = ONE_DAY * 180;
