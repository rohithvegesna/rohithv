"use client";

import { useEffect, useRef, useState } from "react";
import { brand } from "@/config/brand";

/*
  Fill to the cent — the $20 game, the way everyone plays it at the pump.
  Hold the trigger and the sale climbs; let go on the cent. Five fills, each
  faster than the last, and from round three the nozzle keeps counting for
  a moment after you release. Overshoot the target by five dollars and the
  pre-authorization cuts the pump off.

  Client-only (see PumpGameLoader): the best score lives in localStorage,
  which is a per-viewer convenience, never required.
*/

const PRICE = brand.fuel.pricePerGallon;
const ROUNDS = [
  { name: "Warm-up", target: 1000, rate: 1.6, lag: 0 },
  { name: "The classic", target: 2000, rate: 2.4, lag: 0 },
  { name: "Worn nozzle", target: 2500, rate: 3.2, lag: 2 },
  { name: "High flow", target: 4000, rate: 4.5, lag: 3 },
  { name: "Full service", target: null, rate: 6, lag: 4 }, // drawn when the round starts
];
const OVERRUN = 500; // cents past the target before the pre-auth stops the pump
const MIN_HOLD = 150; // ms — anything shorter is a tap, not a fill
const MAX_RATE = 6;
const POINTS_MAX = 150 * ROUNDS.length;

const points = (d) => (d === 0 ? 150 : Math.max(0, 100 - 4 * d));
const money = (c) => `$${(c / 100).toFixed(2)}`;
const readBest = () => {
  try {
    const v = Number(localStorage.getItem("pump:best"));
    return Number.isFinite(v) && v > 0 ? v : null;
  } catch {
    return null;
  }
};
const writeBest = (v) => {
  try {
    localStorage.setItem("pump:best", String(v));
  } catch {
    /* storage blocked: the game still works */
  }
};

/* A mechanical pump display: each digit is a strip of 0–9 that rolls. */
function Roll({ cents }) {
  const text = (cents / 100).toFixed(2).padStart(6, " ");
  return (
    <span className="roll" aria-hidden="true">
      {[...text].map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={i} className="roll-col">
            <span className="roll-strip" style={{ transform: `translateY(-${ch}em)` }}>
              {"0123456789".split("").map((d) => (
                <span key={d}>{d}</span>
              ))}
            </span>
          </span>
        ) : (
          <span key={i} className="roll-col">
            {ch === " " ? " " : ch}
          </span>
        )
      )}
    </span>
  );
}

export default function PumpGame() {
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState(ROUNDS[0].target);
  const [phase, setPhase] = useState("idle"); // idle | pumping | stopped | done
  const [cents, setCents] = useState(0);
  const [results, setResults] = useState([]);
  const [best, setBest] = useState(() => readBest());
  const [note, setNote] = useState(null);
  const raf = useRef(0);
  const heldAt = useRef(0);
  const live = useRef(0);
  const pumping = useRef(false);

  const r = ROUNDS[round];
  const total = results.reduce((s, x) => s + x.points, 0);
  const last = results[results.length - 1];
  const flow = Math.max(1, Math.round((r.rate / MAX_RATE) * 5));

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const finish = (stopCents, auto, snap) => {
    cancelAnimationFrame(raf.current);
    pumping.current = false;
    const diff = stopCents - snap.target;
    const result = {
      round: snap.round,
      target: snap.target,
      cents: stopCents,
      diff,
      points: auto ? 0 : points(Math.abs(diff)),
      auto,
    };
    const all = [...snap.results, result];
    setCents(stopCents);
    setResults(all);
    const done = snap.round === ROUNDS.length - 1;
    setPhase(done ? "done" : "stopped");
    if (done) {
      const sum = all.reduce((s, x) => s + x.points, 0);
      if (snap.best == null || sum > snap.best) {
        writeBest(sum);
        setBest(sum);
      }
    }
  };

  const startPump = () => {
    if (phase !== "idle" || pumping.current) return;
    const snap = { round, target, results, best, rate: r.rate };
    pumping.current = true;
    heldAt.current = performance.now();
    live.current = 0;
    setNote(null);
    setPhase("pumping");
    setCents(0);
    const tick = (now) => {
      if (!pumping.current) return;
      const c = Math.floor(((now - heldAt.current) / 1000) * snap.rate * 100);
      if (c >= snap.target + OVERRUN) {
        finish(snap.target + OVERRUN, true, snap);
        return;
      }
      live.current = c;
      setCents(c);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  const stopPump = () => {
    if (!pumping.current) return;
    if (performance.now() - heldAt.current < MIN_HOLD) {
      /* a tap, not a fill: back to the start of the round */
      cancelAnimationFrame(raf.current);
      pumping.current = false;
      setCents(0);
      setPhase("idle");
      setNote("Hold the trigger, don't tap it.");
      return;
    }
    finish(live.current + r.lag, false, { round, target, results, best, rate: r.rate });
  };

  const next = () => {
    const n = round + 1;
    setRound(n);
    setTarget(ROUNDS[n].target ?? 3000 + Math.floor(Math.random() * 3001));
    setPhase("idle");
    setCents(0);
    setNote(null);
  };

  const restart = () => {
    setRound(0);
    setTarget(ROUNDS[0].target);
    setResults([]);
    setPhase("idle");
    setCents(0);
    setNote(null);
  };

  /* Space and Enter work like the trigger: down pumps, up stops. Both are
     prevented so the button's own click never fires on top. */
  const isTriggerKey = (e) => e.key === " " || e.key === "Enter";
  const onTriggerKeyDown = (e) => {
    if (!isTriggerKey(e)) return;
    e.preventDefault();
    if (!e.repeat) startPump();
  };
  const onTriggerKeyUp = (e) => {
    if (!isTriggerKey(e)) return;
    e.preventDefault();
    stopPump();
  };

  const status = note
    ? note
    : phase === "idle"
      ? `Fill to ${money(target)}. Hold the trigger, release on the cent.${r.lag ? ` The nozzle adds ${r.lag}¢ after you let go.` : ""}`
      : phase === "pumping"
        ? "Pumping…"
        : last.auto
          ? `Auto-stop at ${money(last.cents)} — the pre-authorization cut you off. 0 points.`
          : last.diff === 0
            ? `${money(last.cents)} — to the cent. 150 points.`
            : `${money(last.cents)} — ${Math.abs(last.diff)}¢ ${last.diff > 0 ? "over" : "short"}. ${last.points} points.`;

  return (
    <div className="pump">
      <p className="tag flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line/70 pb-3 text-muted">
        <span className="text-fg">{brand.storeName}</span>
        <span>· Dispenser 04</span>
        <span>· {brand.fuel.productName}</span>
        <span>· ${PRICE.toFixed(2)}/gal</span>
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <div>
          <p className="tag text-muted">This sale $</p>
          <p className="pump-big mt-1">
            <Roll cents={cents} />
            {phase !== "pumping" ? <span className="sr-only">{money(cents)}</span> : null}
          </p>
        </div>
        <div>
          <p className="tag text-muted">Gallons</p>
          <p className="pump-mid mt-1 tabular-nums">{(cents / 100 / PRICE).toFixed(3)}</p>
        </div>
        <div>
          <p className="tag text-muted">Price/gal</p>
          <p className="pump-mid mt-1 tabular-nums">{PRICE.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-x-6 gap-y-3 border-y border-line/70 py-4 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center">
        <p className="tag text-amber">
          Round {round + 1}/{ROUNDS.length} · {r.name}
        </p>
        <p className="tag text-fg">
          Fill to <span className="text-amber">{money(target)}</span>
        </p>
        <p className="tag text-muted" aria-label={`Flow ${flow} of 5`}>
          Flow{" "}
          <span aria-hidden="true">
            {"●".repeat(flow)}
            <span className="opacity-40">{"●".repeat(5 - flow)}</span>
          </span>
        </p>
        <p className="tag text-muted">Lag {r.lag}¢</p>
      </div>

      <button
        type="button"
        className={`pump-trigger mt-6${phase === "pumping" ? " is-on" : ""}`}
        disabled={phase === "stopped" || phase === "done"}
        aria-label={phase === "pumping" ? "Pumping. Release to stop." : "Hold to pump"}
        onPointerDown={(e) => {
          e.preventDefault();
          e.currentTarget.setPointerCapture?.(e.pointerId);
          startPump();
        }}
        onPointerUp={stopPump}
        onPointerCancel={stopPump}
        onKeyDown={onTriggerKeyDown}
        onKeyUp={onTriggerKeyUp}
        onBlur={stopPump}
        onContextMenu={(e) => e.preventDefault()}
      >
        {phase === "pumping" ? `Pumping · release at ${money(target)}` : "Hold to pump"}
      </button>

      <p role="status" aria-live="polite" className="dg-readout mt-5">
        {status}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {phase === "stopped" ? (
          <button type="button" onClick={next} className="btn !px-4 !py-2 !text-[0.7rem]">
            Next fill →
          </button>
        ) : null}
        {phase === "done" ? (
          <>
            <div className="slip px-5 py-4 text-[0.72rem] leading-relaxed">
              <p className="font-semibold tracking-[0.14em]">TXN SETTLED ✓</p>
              <p className="mt-1 opacity-80">
                {ROUNDS.length} fills · score {total} / {POINTS_MAX}
                {best != null ? ` · best ${best}` : ""}
              </p>
            </div>
            <button type="button" onClick={restart} className="btn-ghost !px-4 !py-2 !text-[0.7rem]">
              Pump again
            </button>
          </>
        ) : null}
      </div>

      {results.length ? (
        <ol className="tag mt-6 space-y-1.5 text-muted" aria-label="Fills so far">
          {results.map((x) => (
            <li key={x.round} className="flex flex-wrap gap-x-3">
              <span className="w-8 text-amber">R{x.round + 1}</span>
              <span className="text-fg">{money(x.target)}</span>
              <span>→ {money(x.cents)}</span>
              <span>
                {x.auto
                  ? "auto-stop"
                  : x.diff === 0
                    ? "exact"
                    : `${Math.abs(x.diff)}¢ ${x.diff > 0 ? "over" : "short"}`}
              </span>
              <span className="ml-auto tabular-nums text-fg">+{x.points}</span>
            </li>
          ))}
          <li className="flex gap-x-3 border-t border-line/70 pt-2">
            <span className="w-8">Σ</span>
            <span className="text-fg">
              {total} / {POINTS_MAX}
            </span>
            {best != null ? <span className="ml-auto">best {best}</span> : null}
          </li>
        </ol>
      ) : null}
    </div>
  );
}
