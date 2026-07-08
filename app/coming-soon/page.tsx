import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Domeniul Locus — opening soon",
  description: "Un loc. Un timp. Un vin. — Opening soon.",
  robots: { index: false, follow: false },
};

export default function ComingSoonPage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        alignItems: "center",
        justifyItems: "center",
        padding: "clamp(28px, 5vw, 56px) clamp(20px, 4.5vw, 56px)",
        background: "var(--bg)",
        color: "var(--ink)",
        textAlign: "center",
      }}
    >
      {/* TOP: eyebrow discret */}
      <div
        style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "var(--ink-mute)",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <span style={{ width: 24, height: 1, background: "currentColor", opacity: 0.5 }} />
        <span>opening soon</span>
        <span style={{ width: 24, height: 1, background: "currentColor", opacity: 0.5 }} />
      </div>

      {/* CENTER: logo + tagline */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "clamp(32px, 6vh, 64px)",
        }}
      >
        <Image
          src="/brand/logo-locus.png"
          alt="Domeniul Locus"
          width={1200}
          height={469}
          priority
          style={{
            width: "clamp(280px, 50vw, 620px)",
            height: "auto",
            display: "block",
          }}
        />
        <p
          style={{
            fontFamily: "var(--font-serif), Georgia, serif",
            fontStyle: "italic",
            fontSize: "clamp(22px, 3vw, 34px)",
            lineHeight: 1.2,
            letterSpacing: "0.005em",
            color: "var(--ink)",
            margin: 0,
          }}
        >
          un loc. un timp. un vin.
        </p>
      </div>

      {/* BOTTOM: ornament + coordonate */}
      <footer
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 22,
          color: "var(--ink-soft)",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          aria-hidden="true"
          style={{ display: "block", color: "var(--ink)" }}
        >
          <path
            d="M12 3.2 C 12.9 7.4, 14.6 9.1, 18.8 10 C 14.6 10.9, 12.9 12.6, 12 16.8 C 11.1 12.6, 9.4 10.9, 5.2 10 C 9.4 9.1, 11.1 7.4, 12 3.2 Z M 12 8 C 12.3 9.6, 13 10.3, 14.6 10.6 C 13 10.9, 12.3 11.6, 12 13.2 C 11.7 11.6, 11 10.9, 9.4 10.6 C 11 10.3, 11.7 9.6, 12 8 Z"
            fill="currentColor"
            fillRule="evenodd"
          />
        </svg>
        <p
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: 11,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "var(--ink-mute)",
            margin: 0,
          }}
        >
          DOC-CMD Panciu · 45.98°N 27.30°E
        </p>
      </footer>
    </main>
  );
}
