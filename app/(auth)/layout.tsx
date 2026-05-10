import Image from "next/image";
import Link from "next/link";
import { FilmGrain } from "@/components/film-grain";

/**
 * Minimal layout for /cont/login + /cont/signup — Locus logo top, no nav,
 * no cart, no sidebar. Standalone auth shell.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <FilmGrain />

      <header className="auth-header">
        <Link
          href="/"
          className="auth-brand"
          aria-label="Domeniul Locus — acasă"
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
      </header>

      <main className="auth-main">{children}</main>

      <footer className="auth-footer-mini">
        <Link href="/termeni">Termeni</Link>
        <span aria-hidden="true">·</span>
        <Link href="/confidentialitate">Confidențialitate</Link>
        <span aria-hidden="true">·</span>
        <Link href="/contact">Contact</Link>
      </footer>
    </>
  );
}
