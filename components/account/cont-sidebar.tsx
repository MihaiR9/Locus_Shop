"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MockUser } from "@/lib/mock-account";

const NAV = [
  { href: "/cont", label: "Acasă cont" },
  { href: "/cont/comenzi", label: "Comenzi" },
  { href: "/cont/adrese", label: "Adrese" },
  { href: "/cont/profil", label: "Profil" },
];

export function ContSidebar({ user }: { user: MockUser }) {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/cont") return pathname === "/cont";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="cont-sidebar" aria-label="Navigare cont">
      <div className="cont-sidebar-greeting">
        bună, {user.firstName}.
      </div>
      <div className="cont-sidebar-email">{user.email}</div>

      <nav>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={isActive(item.href) ? "is-active" : ""}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        className="cont-sidebar-logout"
        onClick={() => {
          // TODO: real logout via Supabase auth.signOut() — for now, no-op.
          alert("Logout va fi implementat când conectăm Supabase Auth.");
        }}
      >
        Ieșire
      </button>
    </aside>
  );
}
