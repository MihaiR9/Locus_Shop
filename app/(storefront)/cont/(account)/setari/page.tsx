import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SettingsForm } from "./settings-form";
import { GdprActions } from "./gdpr-actions";
import { getCurrentUser } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "Setări · Cont",
};

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/cont/login");

  return (
    <>
      <div className="eyebrow">setări · securitate · GDPR</div>
      <h1>Setări cont.</h1>
      <p className="lead-mono">
        Modifică datele de autentificare și preferințele. Schimbarea
        adresei de email sau a parolei cere confirmare pe email pentru
        siguranță. Vezi{" "}
        <Link href="/confidentialitate" style={{ color: "var(--ink-soft)" }}>
          Politica de confidențialitate
        </Link>
        .
      </p>

      <section className="cont-section">
        <SettingsForm
          user={{
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            marketingOptIn: user.marketingOptIn,
          }}
        />
      </section>

      <section className="cont-section">
        <div className="cont-section-head">
          <h2>Date GDPR</h2>
        </div>
        <p className="settings-note" style={{ marginBottom: 16 }}>
          Ai dreptul să descarci toate datele tale (comenzi, adrese, profil)
          într-un export JSON și să ceri ștergerea contului. Comenzile
          finalizate sunt păstrate 10 ani conform legislației fiscale, dar
          sunt anonimizate la ștergerea contului.
        </p>
        <GdprActions />
      </section>
    </>
  );
}
