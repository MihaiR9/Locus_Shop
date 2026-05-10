import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Conectare · Cont",
  description:
    "Conectează-te în contul tău Domeniul Locus pentru a vedea comenzile.",
};

export default function LoginPage() {
  return (
    <div className="cont-login">
      <div className="cont-login-card">
        <div className="eyebrow">contul tău</div>
        <h1>Bun venit.</h1>
        <p className="lead">
          Alege o metodă de conectare. Dacă nu ai încă cont, creează unul în
          mai puțin de un minut.
        </p>
        <LoginForm />
        <div className="auth-cross-link">
          Nu ai cont?
          <Link href="/cont/signup">Creează cont</Link>
        </div>
        <p
          style={{
            marginTop: 20,
            fontFamily: "var(--font-mono), monospace",
            fontSize: 11,
            lineHeight: 1.7,
            color: "var(--ink-mute)",
            textAlign: "center",
          }}
        >
          Continuând, ești de acord cu{" "}
          <Link href="/termeni" style={{ color: "var(--ink-soft)" }}>
            Termenii
          </Link>{" "}
          și{" "}
          <Link href="/confidentialitate" style={{ color: "var(--ink-soft)" }}>
            Politica de confidențialitate
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
