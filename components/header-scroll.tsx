"use client";

import { useEffect } from "react";

/** Toggles `.is-scrolled` on .site-header when scrollY > 4 (matches Landing_V1.html). */
export function HeaderScrollEffect() {
  useEffect(() => {
    const header = document.querySelector(".site-header");
    if (!header) return;

    const apply = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 4);
    };
    apply();
    window.addEventListener("scroll", apply, { passive: true });
    return () => window.removeEventListener("scroll", apply);
  }, []);

  return null;
}
