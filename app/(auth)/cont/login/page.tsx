import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { getCurrentUser } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "Conectare · Cont",
  description:
    "Conectează-te în contul tău Domeniul Locus pentru a vedea comenzile.",
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/cont");

  return (
    <div className="auth-card">
      <h1 className="auth-card-title">Autentifică-te cu email</h1>
      <LoginForm />
      <p className="auth-helper">
        Nu ai cont?{" "}
        <Link href="/cont/signup" style={{ color: "var(--ink)" }}>
          Creează unul aici
        </Link>
        .
      </p>
      <p className="auth-help-link">
        <Link href="/contact">Ai nevoie de ajutor?</Link>
      </p>
    </div>
  );
}
