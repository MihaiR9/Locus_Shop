"use client";

/**
 * Monochrome Google button — uses currentColor (ink) for the "G" mark
 * to stay in the brand palette. Real OAuth uses Google's color logo
 * inside the OAuth popup itself.
 */
export function GoogleButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="btn-social-tile"
      onClick={onClick}
      disabled={disabled}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M21.6 12.227c0-.708-.063-1.39-.18-2.044H12v3.866h5.382a4.6 4.6 0 0 1-1.996 3.018v2.51h3.232c1.892-1.745 2.982-4.31 2.982-7.35Z" />
        <path d="M12 22c2.7 0 4.964-.895 6.618-2.423l-3.232-2.51c-.895.6-2.04.954-3.386.954-2.604 0-4.81-1.76-5.595-4.123H3.064v2.59A9.998 9.998 0 0 0 12 22Z" />
        <path d="M6.405 13.898A6.005 6.005 0 0 1 6.09 12c0-.66.114-1.3.314-1.898V7.51H3.064A10.005 10.005 0 0 0 2 12c0 1.614.386 3.14 1.064 4.49l3.341-2.592Z" />
        <path d="M12 5.977c1.468 0 2.786.504 3.823 1.495l2.868-2.868C16.96 3.0 14.696 2 12 2A9.998 9.998 0 0 0 3.064 7.51l3.34 2.592C7.19 7.736 9.395 5.977 12 5.977Z" />
      </svg>
      {label}
    </button>
  );
}

export function PhoneButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="btn-social-tile"
      onClick={onClick}
      disabled={disabled}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="6" y="2" width="12" height="20" rx="2" />
        <line x1="11" y1="18" x2="13" y2="18" />
      </svg>
      {label}
    </button>
  );
}
