"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/(auth)/cont/auth-actions";

const NAV = [
  { href: "/cont", label: "Acasă cont" },
  { href: "/cont/comenzi", label: "Comenzi" },
  { href: "/cont/retururi", label: "Retururi" },
  { href: "/cont/adrese", label: "Adrese" },
  { href: "/cont/facturare", label: "Date facturare" },
  { href: "/cont/setari", label: "Setări" },
];

type SidebarUser = { firstName: string; email: string };

export function ContSidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/cont") return pathname === "/cont";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="cont-sidebar" aria-label="Navigare cont">
      <div className="cont-sidebar-greeting">
        bună, {user.firstName || "client"}.
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

      <form action={logoutAction}>
        <button type="submit" className="cont-sidebar-logout">
          Ieșire
        </button>
      </form>
    </aside>
  );
}
