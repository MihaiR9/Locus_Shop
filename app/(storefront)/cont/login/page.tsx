import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Conectare · Cont",
  description: "Conectează-te în contul tău Domeniul Locus pentru a vedea comenzile.",
};

export default function LoginPage() {
  return (
    <div className="cont-login">
      <div className="cont-login-card">
        <div className="eyebrow">contul tău</div>
        <h1>Bun venit.</h1>
        <p className="lead">
          Pune-ți adresa de email și îți trimitem un link pentru conectare.
          Fără parolă — un email per sesiune.
        </p>
        <LoginForm />
        <p
          style={{
            marginTop: 28,
            fontFamily: "var(--font-mono), monospace",
            fontSize: 11,
            lineHeight: 1.7,
            color: "var(--ink-mute)",
          }}
        >
          Nu ai încă cont? Pune adresa și creezi unul automat la primul login.
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
