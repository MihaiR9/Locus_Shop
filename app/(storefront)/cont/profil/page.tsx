import type { Metadata } from "next";
import { MOCK_USER } from "@/lib/mock-account";
import { ProfileForm } from "./profile-form";
import { GdprActions } from "./gdpr-actions";

export const metadata: Metadata = {
  title: "Profil · Cont",
};

export default function ProfilePage() {
  const user = MOCK_USER;

  return (
    <>
      <div className="eyebrow">date personale</div>
      <h1>Profilul tău.</h1>
      <p className="lead-mono">
        Detaliile tale de cont. Le folosim doar pentru livrare și comunicarea
        legată de comenzi. Vezi{" "}
        <a href="/confidentialitate" style={{ color: "var(--ink-soft)" }}>
          Politica de confidențialitate
        </a>{" "}
        pentru detalii.
      </p>

      <section className="cont-section">
        <ProfileForm user={user} />
      </section>

      <section className="cont-section">
        <div className="cont-section-head">
          <h2>Date GDPR</h2>
        </div>
        <GdprActions />
        <p
          style={{
            marginTop: 16,
            fontFamily: "var(--font-mono), monospace",
            fontSize: 11,
            lineHeight: 1.7,
            color: "var(--ink-mute)",
          }}
        >
          Comenzile finalizate sunt păstrate 10 ani conform legislației fiscale,
          chiar și după ștergerea contului — sunt anonimizate.
        </p>
      </section>
    </>
  );
}
