"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

/*
  Front door for NIGHT SHIFT. The classic page is always the real page —
  this gate only decides whether the game overlay mounts on top of it.

  Rules:
  - Never eligible when the visitor prefers reduced motion, asked to save
    data, has no WebGL, or is on a weak device. They keep the full classic
    page and never see game UI.
  - Desktop, eligible, no saved preference → the world loads on idle and
    takes over when ready. Mobile waits for an explicit Start tap.
  - "Classic site" in the HUD saves the choice; the Play button saves the
    opposite. localStorage key: rv-mode.
*/

const Game = dynamic(() => import("@/components/game/Game"), { ssr: false });

const MODE_KEY = "rv-mode";

function eligible() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (navigator.connection?.saveData) return false;
  if (navigator.deviceMemory !== undefined && navigator.deviceMemory < 4) return false;
  if (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency < 4)
    return false;
  try {
    const c = document.createElement("canvas");
    if (!(c.getContext("webgl2") || c.getContext("webgl"))) return false;
  } catch {
    return false;
  }
  return true;
}

export default function GameGate() {
  const [canPlay, setCanPlay] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [warm, setWarm] = useState(false); // start fetching the chunk
  const idleRef = useRef(null);

  useEffect(() => {
    if (!eligible()) return;
    const boot = setTimeout(() => {
      setCanPlay(true);
      const saved = localStorage.getItem(MODE_KEY);
      if (saved === "classic") return;
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      if (coarse && saved !== "game") return; // mobile waits for the tap
      // Desktop (or returning game-mode visitor): load on idle, take over.
      const start = () => {
        setWarm(true);
        setPlaying(true);
      };
      const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 900));
      idleRef.current = { idle: idle(start), cancel: window.cancelIdleCallback ?? clearTimeout };
    }, 0);
    return () => {
      clearTimeout(boot);
      idleRef.current?.cancel(idleRef.current.idle);
    };
  }, []);

  useEffect(() => {
    const classic = document.getElementById("classic-root");
    const header = document.querySelector("header");
    const footer = document.querySelector("footer");
    const hidden = playing;
    for (const el of [classic, header, footer]) {
      if (!el) continue;
      el.toggleAttribute("inert", hidden);
      el.setAttribute("aria-hidden", hidden ? "true" : "false");
    }
    document.documentElement.style.overflow = hidden ? "hidden" : "";
    return () => {
      for (const el of [classic, header, footer]) {
        if (!el) continue;
        el.removeAttribute("inert");
        el.removeAttribute("aria-hidden");
      }
      document.documentElement.style.overflow = "";
    };
  }, [playing]);

  const play = () => {
    localStorage.setItem(MODE_KEY, "game");
    setWarm(true);
    setPlaying(true);
  };

  const toClassic = () => {
    localStorage.setItem(MODE_KEY, "classic");
    setPlaying(false);
  };

  if (!canPlay) return null;

  return (
    <>
      {!playing ? (
        <div className="mx-auto max-w-6xl px-5 sm:px-10">
          <button
            type="button"
            onClick={play}
            onMouseEnter={() => setWarm(true)}
            onFocus={() => setWarm(true)}
            className="pad-nc mt-4 inline-flex items-center gap-2.5"
          >
            <span className="led led-on" aria-hidden="true" />
            Play the interactive site
          </button>
        </div>
      ) : null}
      {warm || playing ? (
        <div hidden={!playing}>
          <Game active={playing} onClassic={toClassic} />
        </div>
      ) : null}
    </>
  );
}
