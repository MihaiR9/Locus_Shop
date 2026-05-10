"use client";

export function EditAddressButton({ addressId }: { addressId: string }) {
  return (
    <button
      type="button"
      className="icon-btn"
      aria-label="Editează adresa"
      title="Editează"
      onClick={() =>
        alert(
          `Editarea adresei ${addressId} va fi implementată cu Supabase (Pas 7 backend).`,
        )
      }
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M11.5 2.5l2 2L5 13l-3 0.5 0.5-3z" />
        <path d="M10 4l2 2" />
      </svg>
    </button>
  );
}
