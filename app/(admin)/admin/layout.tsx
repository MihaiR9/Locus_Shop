import Link from "next/link";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/produse", label: "Produse" },
  { href: "/admin/comenzi", label: "Comenzi" },
  { href: "/admin/clienti", label: "Clienți" },
  { href: "/admin/cupoane", label: "Cupoane" },
  { href: "/admin/setari", label: "Setări" },
];

/**
 * Admin layout — sidebar + main area. Fără SiteHeader / CartDrawer / AgeGate /
 * CookieBanner. Auth gating se face în middleware.ts (cookie locus-admin-session).
 *
 * La Faza 2 înlocuim cookie-mock cu Supabase Auth real (magic link, role check).
 */
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-label="Navigare admin">
        <Link href="/" className="admin-brand">
          <span className="admin-brand-mark">L</span>
          <span className="admin-brand-text">
            <strong>Domeniul Locus</strong>
            <em>Admin</em>
          </span>
        </Link>

        <nav className="admin-nav" aria-label="Secțiuni admin">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="admin-nav-link">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="admin-footer-info">
          <Link href="/" className="admin-back-link">← înapoi la site</Link>
          <span className="admin-version">v0.1 · pre-MVP</span>
        </div>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  );
}
