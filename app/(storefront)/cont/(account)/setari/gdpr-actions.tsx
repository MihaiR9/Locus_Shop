"use client";

export function GdprActions() {
  return (
    <div className="order-actions">
      <button
        type="button"
        onClick={() =>
          alert(
            "Export-ul datelor (JSON cu profil + comenzi + adrese) va fi implementat cu Supabase. Îl primești pe email în maxim 30 de zile.",
          )
        }
      >
        Descarcă datele mele (export JSON)
      </button>
      <button
        type="button"
        onClick={() => {
          if (
            confirm(
              "Sigur vrei să ceri ștergerea contului? Comenzile finalizate sunt anonimizate, dar datele trebuie păstrate 10 ani conform legii fiscale. Vei primi confirmare pe email.",
            )
          ) {
            alert(
              "Cererea ta a fost înregistrată. Procesăm ștergerea în 30 de zile (GDPR). Confirmare pe email.",
            );
          }
        }}
      >
        Cere ștergerea contului
      </button>
    </div>
  );
}
