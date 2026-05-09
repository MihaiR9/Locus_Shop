import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./lib/**/*.{ts,tsx,mdx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Brand palette (raw)
        pamant: "#EBE1DA",
        nisip: "#CBBEAE",
        piatra: "#A89D8D",
        vie: "#3E4336",
        stejar: "#4A3C2D",
        pivnita: "#1A1A1A",

        // Semantic tokens — bound to CSS vars (theme-aware)
        bg: "var(--bg)",
        "bg-alt": "var(--bg-alt)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        "ink-mute": "var(--ink-mute)",
        line: "var(--line)",
        "field-bg": "var(--field-bg)",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        eyebrow: "0.22em",
        caps: "0.18em",
      },
      transitionTimingFunction: {
        locus: "cubic-bezier(0.22, 0.61, 0.36, 1)",
      },
      transitionDuration: {
        fast: "240ms",
        base: "480ms",
        slow: "800ms",
      },
      maxWidth: {
        container: "1320px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
