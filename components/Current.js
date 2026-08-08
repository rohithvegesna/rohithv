"use client";

import { useEffect } from "react";

/*
  Energizes the bus rail: --energy tracks scroll progress 0..1.
  Under prefers-reduced-motion the CSS holds the rail fully lit and this
  driver never attaches.
*/
export default function Current() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    let ticking = false;
    const update = () => {
      ticking = false;
      const max = root.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 1;
      root.style.setProperty("--energy", p.toFixed(4));
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return null;
}
