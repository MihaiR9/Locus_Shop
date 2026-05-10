import type { Metadata } from "next";
import { LoginMockButton } from "./login-mock-button";

export const metadata: Metadata = {
  title: "Admin · Login",
};

export default function AdminLoginPage() {
  return (
    <div className="admin-login-shell">
      <div className="admin-login-card">
        <div className="eyebrow" style={{ justifyContent: "center", marginBottom: 18 }}>
          Domeniul Locus · Admin
        </div>
        <h1>Autentificare.</h1>
        <p>
          Mock login pentru dezvoltare. La <strong>Faza 2</strong> înlocuim
          cu Supabase magic link (email → click pe link-ul din inbox → autentificat).
        </p>

        <LoginMockButton />

        <p className="admin-login-note">
          Cookie-ul <code>locus-admin-session</code> este placeholder. NU în prod.
        </p>
      </div>
    </div>
  );
}
