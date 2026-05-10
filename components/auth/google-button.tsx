"use client";

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
      className="btn-google"
      onClick={onClick}
      disabled={disabled}
    >
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path
          fill="#FFC107"
          d="M43.61 20.08H42V20H24v8h11.3c-1.65 4.66-6.08 8-11.3 8a12 12 0 1 1 0-24c3.06 0 5.84 1.15 7.96 3.04l5.66-5.66A20 20 0 1 0 24 44c11.04 0 20-8.96 20-20 0-1.34-.14-2.66-.39-3.92z"
        />
        <path
          fill="#FF3D00"
          d="M6.31 14.69l6.57 4.81C14.66 16.1 18.96 13 24 13c3.06 0 5.84 1.15 7.96 3.04l5.66-5.66A20 20 0 0 0 6.31 14.69z"
        />
        <path
          fill="#4CAF50"
          d="M24 44c5.16 0 9.86-1.97 13.4-5.2l-6.18-5.23A12 12 0 0 1 12.7 28.36l-6.51 5.02C9.5 39.55 16.23 44 24 44z"
        />
        <path
          fill="#1976D2"
          d="M43.61 20.08H42V20H24v8h11.3c-.79 2.24-2.24 4.18-4.1 5.57l6.18 5.23C40.95 35.04 44 30.04 44 24c0-1.34-.14-2.66-.39-3.92z"
        />
      </svg>
      {label}
    </button>
  );
}
