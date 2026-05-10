"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { CartButton } from "@/components/cart/cart-button";

type NavItem = {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
};

const NAV_LINKS: NavItem[] = [
  { href: "/", label: "Acasă" },
  { href: "/despre", label: "Despre noi" },
  {
    href: "/shop",
    label: "Colecție",
    children: [
      { href: "/cuvinte", label: "Cuvinte" },
      { href: "/semne", label: "Semne" },
      { href: "/pauze", label: "Pauze" },
    ],
  },
  { href: "/shop", label: "Shop" },
  { href: "/contact", label: "Contact" },
  { href: "/parteneri", label: "Parteneri" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  // hover with small delay so the dropdown doesn't disappear when crossing the gap
  function hoverOpen(label: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenDropdown(label);
  }
  function hoverClose() {
    closeTimer.current = setTimeout(() => setOpenDropdown(null), 150);
  }

  return (
    <>
      <header className="site-header">
        <div className="container-locus">
          <div className="header-inner">
            <Link
              href="/#acasa"
              className="brand"
              aria-label="Domeniul Locus — acasă"
              onClick={() => setOpen(false)}
            >
              <Image
                src="/brand/logo-locus.png"
                alt="Domeniul Locus"
                width={140}
                height={38}
                priority
                className="brand-img"
              />
            </Link>

            <nav className="nav-main" aria-label="Navigare principală">
              {NAV_LINKS.map((l) =>
                l.children ? (
                  <div
                    key={l.label}
                    className={`nav-item-dropdown ${openDropdown === l.label ? "is-open" : ""}`}
                    onMouseEnter={() => hoverOpen(l.label)}
                    onMouseLeave={hoverClose}
                  >
                    <button
                      type="button"
                      className="nav-trigger"
                      aria-haspopup="true"
                      aria-expanded={openDropdown === l.label}
                      onClick={() =>
                        setOpenDropdown((cur) => (cur === l.label ? null : l.label))
                      }
                    >
                      {l.label}
                      <svg
                        className="caret"
                        width="8"
                        height="6"
                        viewBox="0 0 8 6"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M1 1.5 L4 4.5 L7 1.5"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <div
                      className="nav-dropdown"
                      role="menu"
                      aria-hidden={openDropdown !== l.label}
                    >
                      {l.children.map((c) => (
                        <Link
                          key={c.href}
                          href={c.href}
                          role="menuitem"
                          onClick={() => setOpenDropdown(null)}
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link key={l.label} href={l.href}>
                    {l.label}
                  </Link>
                ),
              )}
            </nav>

            <div className="nav-actions">
              <div className="lang-switch" role="group" aria-label="Limbă">
                <span className="is-active" aria-current="true">
                  RO
                </span>
                <span className="sep" aria-hidden="true" />
                <span className="lang-muted" aria-hidden="true">
                  EN
                </span>
              </div>
              <Link
                href="/cont"
                className="account-btn"
                aria-label="Contul meu"
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  aria-hidden="true"
                >
                  <circle cx="8" cy="6" r="2.5" />
                  <path d="M3 14 C3.5 11 5.5 10 8 10 C10.5 10 12.5 11 13 14" />
                </svg>
              </Link>
              <CartButton />
              <ThemeToggle />
              <button
                type="button"
                className={`menu-toggle ${open ? "is-open" : ""}`}
                aria-label={open ? "Închide meniu" : "Deschide meniu"}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
              >
                <span />
                <span />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        className={`nav-overlay ${open ? "is-open" : ""}`}
        aria-hidden={!open}
      >
        {NAV_LINKS.map((l) => (
          <div key={l.label} className="nav-overlay-item">
            <Link href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
            {l.children && (
              <div className="nav-overlay-children">
                {l.children.map((c) => (
                  <Link key={c.href} href={c.href} onClick={() => setOpen(false)}>
                    {c.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
        <div className="lang-switch" role="group" aria-label="Limbă">
          <span className="is-active">RO</span>
          <span className="sep" aria-hidden="true" />
          <span className="lang-muted">EN</span>
        </div>
      </div>
    </>
  );
}
