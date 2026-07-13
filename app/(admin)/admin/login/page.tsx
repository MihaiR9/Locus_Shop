import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "./login-form";
import { getCurrentAdmin } from "@/lib/auth/current-admin";

export const metadata: Metadata = {
  title: "Admin · Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");

  return (
    <main className="admin-login-shell">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <span className="admin-brand-mark">L</span>
          <span>Locus Admin</span>
        </div>
        <h1 className="admin-login-title">Autentificare</h1>
        <p className="admin-login-sub">
          Primești un email cu link magic. Click pe el și ai acces la panou.
        </p>

        <AdminLoginForm />

        <p className="admin-login-note">
          Doar utilizatorii cu rol <code>admin</code> pot intra.
        </p>
      </div>
    </main>
  );
}
