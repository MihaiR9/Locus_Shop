"use client";

export function AddAddressButton() {
  return (
    <button
      type="button"
      className="more"
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
      }}
      onClick={() =>
        alert("Adăugarea de adrese va fi implementată cu Supabase.")
      }
    >
      + adaugă adresă
    </button>
  );
}
