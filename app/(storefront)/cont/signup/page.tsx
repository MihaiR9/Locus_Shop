import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Creează cont · Locus",
  description:
    "Creează cont la Domeniul Locus pentru a urmări comenzile, salva adrese și primi notițe rare din vie.",
};

export default function SignupPage() {
  return (
    <div className="cont-login">
      <div className="cont-login-card" style={{ maxWidth: 520 }}>
        <div className="eyebrow">cont nou</div>
        <h1>Bun venit la Locus.</h1>
        <p className="lead">
          Alege metoda — email, Google sau telefon. Pentru email cere câteva
          detalii ca să avem comanda completă din prima.
        </p>
        <SignupForm />
        <div className="auth-cross-link">
          Ai deja cont?
          <Link href="/cont/login">Conectează-te</Link>
        </div>
      </div>
    </div>
  );
}
