"use client";

import {
  createElement,
  useEffect,
  useState,
  type ElementType,
  type ReactNode,
  type HTMLAttributes,
} from "react";

type Props = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  stagger?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Wraps content with the reveal/reveal-stagger class and toggles `.in`
 * the first time it intersects the viewport. Mirrors Landing_V1.html
 * IntersectionObserver behavior (threshold 0.12, rootMargin -8% bottom).
 */
export function Reveal({
  as = "div",
  stagger = false,
  className = "",
  children,
  ...rest
}: Props) {
  const [el, setEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!el) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      el.classList.add("in");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [el]);

  const cls = `${stagger ? "reveal-stagger" : "reveal"} ${className}`.trim();

  return createElement(as, { ref: setEl, className: cls, ...rest }, children);
}
