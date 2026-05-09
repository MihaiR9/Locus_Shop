import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { CartButton } from "@/components/cart/cart-button";

const NAV_LINKS = [
  { href: "/", label: "Acasă" },
  { href: "/despre", label: "Despre noi" },
  { href: "/#vinuri", label: "Vinuri" },
  { href: "/#locul", label: "Locul" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container-locus">
        <div className="header-inner">
          <Link href="/#acasa" className="brand" aria-label="Domeniul Locus — acasă">
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
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="nav-actions">
            <div className="lang-switch" role="group" aria-label="Limbă">
              <span className="is-active" aria-current="true">RO</span>
              <span className="sep" aria-hidden="true" />
              <span className="lang-muted" aria-hidden="true">EN</span>
            </div>
            <CartButton />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
