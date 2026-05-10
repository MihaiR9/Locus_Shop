"use client";

export function GdprActions() {
  return (
    <div className="order-actions">
      <button
        type="button"
        onClick={() =>
          alert("Export-ul datelor va fi implementat cu Supabase (Pas 7 backend).")
        }
      >
        Descarcă datele mele
      </button>
      <button
        type="button"
        onClick={() =>
          alert(
            "Cererea de ștergere o tratăm manual prin email. Trimite la contact@domeniul-locus.ro și răspundem în 30 de zile (GDPR).",
          )
        }
      >
        Cere ștergerea contului
      </button>
    </div>
  );
}
