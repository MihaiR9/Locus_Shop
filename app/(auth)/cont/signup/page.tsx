import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignupForm } from "./signup-form";
import { getCurrentUser } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "Creează cont · Locus",
  description:
    "Creează cont la Domeniul Locus pentru a urmări comenzile, salva adrese și primi notițe rare din vie.",
};

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/cont");

  return (
    <div className="auth-card" style={{ maxWidth: 520 }}>
      <h1 className="auth-card-title">Creează cont nou</h1>
      <SignupForm />
      <p className="auth-helper">
        Ai deja cont?{" "}
        <Link href="/cont/login" style={{ color: "var(--ink)" }}>
          Conectează-te
        </Link>
        .
      </p>
      <p className="auth-help-link">
        <Link href="/contact">Ai nevoie de ajutor?</Link>
      </p>
    </div>
  );
}
