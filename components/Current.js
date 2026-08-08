"use client";

import { useEffect } from "react";

/*
  Two quiet drivers, no UI:
  1. --energy tracks scroll progress so the bus rail lights as you read.
  2. The ambient schematic energizes when it enters the viewport, and its
     packet pauses offscreen or when the tab is hidden.
  Under prefers-reduced-motion neither attaches; CSS renders the designed
  static state (rail and net fully energized, packet gone).
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

    const fig = document.querySelector(".sch-figure");
    let io;
    let onVis;
    if (fig) {
      io = new IntersectionObserver(
        ([entry]) => {
          fig.classList.toggle("paused", !entry.isIntersecting);
          if (entry.isIntersecting) fig.classList.add("energized");
        },
        { threshold: 0.1 }
      );
      io.observe(fig);
      onVis = () =>
        fig.classList.toggle("paused", document.visibilityState === "hidden");
      document.addEventListener("visibilitychange", onVis);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      io?.disconnect();
      if (onVis) document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
  return null;
}
