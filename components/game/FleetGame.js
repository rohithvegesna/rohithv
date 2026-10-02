"use client";

import { useEffect, useRef, useState } from "react";
import { generate, masks, lit, looseEnds, isSolved, par } from "./fleet";

/*
  Light the fleet — the board, the HUD, and the controls. Loaded client-only
  (see FleetGameLoader) so today's board is built from the visitor's date,
  not the build's. Best results per board live in localStorage, which is a
  per-viewer convenience: wrapped, and never required.
*/

const TODAY = new Date().toISOString().slice(0, 10);
const END = [
  [26, 0],
  [52, 26],
  [26, 52],
  [0, 26],
];

const fmt = (ms) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
const bestKey = (seed) => `fleet:best:${seed}`;
const readBest = (seed) => {
  try {
    return JSON.parse(localStorage.getItem(bestKey(seed))) || null;
  } catch {
    return null;
  }
};
const writeBest = (seed, best) => {
  try {
    localStorage.setItem(bestKey(seed), JSON.stringify(best));
  } catch {
    /* private mode, blocked storage: the game still works */
  }
};
const fresh = (board) => ({
  board,
  turns: board.rots.map(() => 0),
  moves: 0,
  startedAt: null,
  finishedAt: null,
});

function Tile({ i, n, base, deg, on, isSrc, onTurn }) {
  const bits = [0, 1, 2, 3].filter((d) => base & (1 << d));
  const kind = isSrc
    ? "cloud"
    : bits.length === 1
      ? "site"
      : base === 5 || base === 10
        ? "trace"
        : "junction";
  const row = Math.floor(i / n) + 1;
  const col = (i % n) + 1;
  return (
    <button
      type="button"
      data-i={i}
      onClick={() => onTurn(i)}
      className={`fl-tile${on ? " fl-on" : ""}`}
      aria-label={`Row ${row}, column ${col}: ${kind}, ${on ? "online" : "offline"}. Turn clockwise.`}
    >
      <svg viewBox="0 0 52 52" aria-hidden="true" style={{ transform: `rotate(${deg}deg)` }}>
        {bits.map((d) => (
          <line key={`g${d}`} className="fl-glow" x1="26" y1="26" x2={END[d][0]} y2={END[d][1]} />
        ))}
        {bits.map((d) => (
          <line key={d} className="fl-trace" x1="26" y1="26" x2={END[d][0]} y2={END[d][1]} />
        ))}
        {kind === "cloud" ? (
          <>
            <circle cx="26" cy="26" r="10" className="fl-hub" />
            <circle cx="26" cy="26" r="4.5" className="fl-hubcore" />
          </>
        ) : kind === "site" ? (
          <>
            <rect x="17" y="17" width="18" height="18" rx="3" className="fl-site" />
            <circle cx="26" cy="26" r="2.8" className="fl-led" />
          </>
        ) : (
          <circle cx="26" cy="26" r="3.2" className="fl-joint" />
        )}
      </svg>
    </button>
  );
}

export default function FleetGame() {
  const [game, setGame] = useState(() => fresh(generate(TODAY)));
  const [best, setBest] = useState(() => readBest(TODAY));
  const [now, setNow] = useState(0);
  const boardRef = useRef(null);

  const { board, turns, moves } = game;
  const { n, src, base } = board;
  const total = n * n;
  const rots = board.rots.map((r, i) => (r + turns[i]) % 4);
  const cur = masks(base, rots);
  const on = lit(base, rots, src, n);
  const online = on.filter(Boolean).length;
  const loose = looseEnds(cur, n);
  const won = game.finishedAt != null;
  const running = game.startedAt != null && !won;
  const elapsed =
    game.startedAt == null
      ? 0
      : (game.finishedAt ?? Math.max(now, game.startedAt)) - game.startedAt;
  const parValue = par(base, board.rots);
  const isToday = board.seed === TODAY;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [running]);

  const load = (seed) => {
    setGame(fresh(generate(seed)));
    setBest(readBest(seed));
    setNow(0);
  };

  const turn = (i) => {
    if (won) return;
    const nextTurns = turns.slice();
    nextTurns[i] += 1;
    const nextRots = board.rots.map((r, k) => (r + nextTurns[k]) % 4);
    const solved = isSolved(base, nextRots, src, n);
    const t = Date.now();
    const next = {
      ...game,
      turns: nextTurns,
      moves: moves + 1,
      startedAt: game.startedAt ?? t,
      finishedAt: solved ? t : null,
    };
    setGame(next);
    if (solved) {
      const time = next.finishedAt - next.startedAt;
      const prev = readBest(board.seed);
      if (
        !prev ||
        next.moves < prev.moves ||
        (next.moves === prev.moves && time < prev.time)
      ) {
        const b = { moves: next.moves, time };
        writeBest(board.seed, b);
        setBest(b);
      }
    }
  };

  /* arrow keys walk the board; Enter and Space turn, as buttons do */
  const onKeyDown = (e) => {
    const step = { ArrowUp: -n, ArrowDown: n, ArrowLeft: -1, ArrowRight: 1 }[e.key];
    if (step === undefined) return;
    const i = Number(e.target?.dataset?.i);
    if (Number.isNaN(i)) return;
    if (e.key === "ArrowLeft" && i % n === 0) return;
    if (e.key === "ArrowRight" && i % n === n - 1) return;
    const j = i + step;
    if (j < 0 || j >= total) return;
    e.preventDefault();
    boardRef.current?.querySelector(`[data-i="${j}"]`)?.focus();
  };

  const status = won
    ? `Fleet online — ${total} of ${total} sites in ${moves} moves, ${fmt(elapsed)}.`
    : online === total && loose > 0
      ? `${loose} loose trace${loose === 1 ? "" : "s"} — every line has to terminate.`
      : `${online} of ${total} online. Turn tiles until every site reaches the cloud.`;

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,22rem)_1fr] md:items-start">
      <div>
        <div
          ref={boardRef}
          role="group"
          aria-label={`Fleet board, ${n} by ${n}. ${isToday ? "Today's board" : `Board ${board.seed}`}.`}
          className={`fl-board${won ? " fl-won" : ""}`}
          style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
          onKeyDown={onKeyDown}
        >
          {cur.map((_, i) => (
            <Tile
              key={i}
              i={i}
              n={n}
              base={base[i]}
              deg={(board.rots[i] + turns[i]) * 90}
              on={on[i]}
              isSrc={i === src}
              onTurn={turn}
            />
          ))}
        </div>
        <p className="tag mt-3 text-muted">
          {isToday ? `Today's board · ${TODAY}` : `Board ${board.seed}`} · par {parValue}
        </p>
      </div>

      <div>
        <dl className="tag grid grid-cols-2 gap-x-6 gap-y-4 text-muted sm:grid-cols-4 md:grid-cols-2">
          <div>
            <dt>Online</dt>
            <dd className="readout-v mt-1 text-fg tabular-nums">
              {online}
              <span className="text-muted">/{total}</span>
            </dd>
          </div>
          <div>
            <dt>Moves</dt>
            <dd className="readout-v mt-1 text-fg tabular-nums">{moves}</dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd className="readout-v mt-1 text-fg tabular-nums">{fmt(elapsed)}</dd>
          </div>
          <div>
            <dt>Best · this board</dt>
            <dd className="readout-v mt-1 whitespace-nowrap text-fg tabular-nums">
              {best ? (
                <>
                  {best.moves}
                  <span className="text-[0.55em] text-muted"> · {fmt(best.time)}</span>
                </>
              ) : (
                <span className="text-muted">—</span>
              )}
            </dd>
          </div>
        </dl>

        <p
          role="status"
          aria-live="polite"
          className={`dg-readout mt-8 ${won ? "!border-ack text-fg" : ""}`}
        >
          {status}
        </p>
        {won ? (
          <div className="slip mt-5 inline-block px-5 py-4 text-[0.72rem] leading-relaxed">
            <p className="font-semibold tracking-[0.14em]">FLEET ONLINE ✓</p>
            <p className="mt-1 opacity-80">
              {moves} moves · par {parValue} · {fmt(elapsed)}
            </p>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => load(TODAY)}
            aria-pressed={isToday}
            className="chip chip-btn"
          >
            Today&apos;s board
          </button>
          <button
            type="button"
            onClick={() => load(Math.random().toString(36).slice(2, 7))}
            className="chip chip-btn"
          >
            New board
          </button>
          <button
            type="button"
            onClick={() => load(board.seed)}
            className="chip chip-btn"
          >
            Reset
          </button>
        </div>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-muted">
          Click or tap a tile to turn it clockwise. Arrow keys move between
          tiles, Enter turns one. Today&apos;s board is the same for everyone
          who visits on {TODAY}; a new board is yours alone.
        </p>
      </div>
    </div>
  );
}
