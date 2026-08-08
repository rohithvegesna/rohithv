"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { site } from "@/data/site";
import { publications } from "@/data/publications";

/*
  Game-first front door. The overlay shell is server-rendered so the very
  first frame is the loading/hero screen; a synchronous inline script in
  the layout adds `nr-boot` to <html> before paint when the visitor is
  eligible (motion OK, WebGL, no Save-Data). No mode is remembered —
  reload always returns here. Closing reveals the classic page below.
*/

const NightRun = dynamic(() => import("@/components/game/nightrun"), { ssr: false });

export default function Overlay() {
  const [phase, setPhase] = useState("loading"); // loading | playing | closed
  const [progress, setProgress] = useState(0);
  const [needsTap, setNeedsTap] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!document.documentElement.classList.contains("nr-boot")) {
        setPhase("closed");
        return;
      }
      setNeedsTap(matchMedia("(pointer: coarse)").matches);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (progress < 100 || needsTap) return;
    const t = setTimeout(
      () => setPhase((p) => (p === "loading" ? "playing" : p)),
      0
    );
    return () => clearTimeout(t);
  }, [progress, needsTap]);

  useEffect(() => {
    const on = phase !== "closed";
    document.documentElement.classList.toggle("nr-lock", on);
    const classic = document.getElementById("classic-root");
    const header = document.querySelector("header");
    const footer = document.querySelector("footer");
    for (const el of [classic, header, footer]) {
      if (!el) continue;
      el.toggleAttribute("inert", on);
      el.setAttribute("aria-hidden", on ? "true" : "false");
    }
    if (!on) document.documentElement.classList.remove("nr-boot");
  }, [phase]);

  const close = () => setPhase("closed");

  if (phase === "closed") return null;

  const loaded = progress >= 100;
  const showStart = loaded && needsTap && phase === "loading";

  return (
    <div id="nr-overlay" className="fixed inset-0 z-[90] bg-substrate">
      {/* game mounts immediately and loads behind the hero screen */}
      <NightRun
        onClassic={close}
        onProgress={(p) => setProgress((q) => Math.max(q, p))}
        started={phase === "playing"}
      />

      {phase === "loading" ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-substrate px-5 text-center">
          <p className="silk-label flex items-center gap-3 text-copper">
            <span className="led led-on" aria-hidden="true" />
            {site.role} · {site.company} · {site.location}
          </p>
          <h2 className="display mt-5 text-[clamp(2.6rem,8vw,5.5rem)] uppercase leading-[0.92] text-silk">
            Rohith Varma <span className="text-gold">Vegesna</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-silk-muted">
            EMV at the pump, edge devices in the field, and the AWS backbone
            behind fuel-station automation for major U.S. retail brands — with{" "}
            {publications.length} peer-reviewed publications along the way.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a href="/resume.json" className="pad-nc">Resume</a>
            <a href={`mailto:${site.email}`} className="pad-nc">Email me</a>
            <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="pad-nc">LinkedIn</a>
            <button type="button" onClick={close} className="pad">
              Classic site
            </button>
          </div>

          <div className="mt-10 w-full max-w-sm">
            <div className="h-1.5 w-full border border-silk/25 bg-substrate-3">
              <div
                className="h-full bg-gold transition-[width] duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="silk-label mt-2.5 text-[0.62rem] text-silk-muted" aria-live="polite">
              {showStart ? "Ready" : `Loading Night Run… ${progress}%`}
            </p>
            {showStart ? (
              <button type="button" onClick={() => setPhase("playing")} className="pad mt-4">
                Tap to start
              </button>
            ) : null}
          </div>
          <p className="silk-label mt-8 max-w-md text-[0.6rem] leading-relaxed text-silk-faint">
            A 60-second night run: drive in, fuel up, grab a snack, check out.
          </p>
        </div>
      ) : null}
    </div>
  );
}
