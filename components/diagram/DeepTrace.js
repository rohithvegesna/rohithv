"use client";

/*
  DEEP TRACE — the living pipeline, two disclosure levels + a simulator.

  L0: five calm stages, ambient packets. Always first paint.
  L1: activating a stage unfolds its internals as a portrait detail sheet
      below (one at a time, Esc collapses, #stage deep-links). Labels are
      textbook payment-industry terms only.
  SIM: RUN TXN fires a one-shot packet end-to-end while an event log prints
      timestamped generic events. The ambient clock occasionally plays the
      offline story: WAN LINK LOST → the store-and-forward queue fills →
      LINK RESTORED → burst flush.
  All numbers on screen are SIMULATED (see legend) and measured from this
  page's own animation.
*/

import { useCallback, useEffect, useRef, useState } from "react";
import { Diagram, Node, Bus, Packet, Region, Ticks } from "./lib";

const STAGES = [
  { id: "tap", title: "TAP", x: 16, w: 100, kind: "terminal", detail: "Where a payment begins." },
  { id: "device", title: "DEVICE", x: 190, w: 140, detail: "Hardware in the field, built to keep working." },
  { id: "site", title: "SITE", x: 400, w: 140, detail: "Every location stays connected." },
  { id: "cloud", title: "CLOUD", x: 610, w: 140, kind: "cloud", detail: "Where the whole fleet comes together." },
  { id: "settled", title: "SETTLED", x: 844, w: 100, kind: "terminal", detail: "Done, and accounted for." },
];

/* L1 internals — textbook terms only. 22 subsystem nodes. */
const L1 = {
  tap: {
    heading: "TAP — entry points",
    nodes: ["CONTACTLESS", "CHIP INSERT", "MAG FALLBACK"],
    note: "Three ways in, one kernel behind them.",
  },
  device: {
    heading: "DEVICE — inside the dispenser",
    nodes: ["EMV KERNEL", "SECURE PIN ENTRY", "DISPENSER CONTROLLER", "FIRMWARE CHANNEL"],
    note: "Certified boundaries; the architecture works around them, never through them.",
  },
  site: {
    heading: "SITE — the forecourt",
    nodes: ["FORECOURT CONTROLLER", "POS LANE", "TERMINAL CONCENTRATOR", "EDGE GATEWAY", "STORE-AND-FORWARD QUEUE"],
    note: "When the WAN drops, the queue holds the day until the link returns.",
  },
  cloud: {
    heading: "CLOUD — the backbone",
    nodes: ["API GATEWAY", "STREAM INGEST", "PROCESSING", "TRANSACTION STORE", "RISK CHECK", "OBSERVABILITY BUS"],
    note: "Everything emits telemetry; silence is a signal too.",
  },
  settled: {
    heading: "SETTLED — the money moment",
    nodes: ["PAYMENT HOST", "BATCH SETTLEMENT", "RECONCILIATION", "LOYALTY SIDECAR"],
    note: "Boring on purpose.",
  },
};

const H_MAIN = "M116 96 H844";
const H_RETURN = "M700 82 H300";
const V_MAIN = "M180 44 V420";
const RAIL = "M170 150 H790";

const SIM_SCRIPT = [
  [0, "00:00.000  TAP_DETECTED"],
  [260, "00:00.124  AUTH_REQUEST → HOST"],
  [900, "00:00.612  RISK_CHECK PASS"],
  [1400, "00:00.783  AUTH_APPROVED ← HOST"],
  [2200, "00:01.940  RECEIPT_PRINTED"],
  [2600, "00:02.410  BATCH_QUEUED"],
];

export default function DeepTrace({ buildDate }) {
  const [expanded, setExpanded] = useState(null);
  const [log, setLog] = useState([]);
  const [sims, setSims] = useState([]); // one-shot packet ids
  const [offline, setOffline] = useState(false);
  const [spark, setSpark] = useState([2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3]);
  const counter = useRef(0);
  const timers = useRef([]);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  const pushLog = useCallback((line) => {
    setLog((l) => [...l.slice(-3), line]);
  }, []);

  const runTxn = useCallback(() => {
    const id = Date.now();
    setSims((s) => [...s.slice(-2), id]);
    counter.current += 6;
    for (const [ms, line] of SIM_SCRIPT) later(() => pushLog(line), ms);
  }, [pushLog]);

  /* ambient clock: sparkline sampling + the offline story */
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const sample = setInterval(() => {
      counter.current += 3; // ambient loop launches ~3 packets per sample
      setSpark((s) => [...s.slice(-11), Math.min(9, 1 + (counter.current % 7))]);
    }, 2500);
    const outage = setInterval(() => {
      setOffline(true);
      pushLog("00:00.000  WAN_LINK LOST — QUEUEING");
      later(() => {
        setOffline(false);
        pushLog("00:03.200  LINK RESTORED — FLUSH ×4");
        [0, 180, 360, 540].forEach((d, i) =>
          later(() => setSims((s) => [...s.slice(-3), Date.now() + i]), d)
        );
      }, 3200);
    }, 34000);
    const pending = timers.current;
    return () => {
      clearInterval(sample);
      clearInterval(outage);
      pending.forEach(clearTimeout);
    };
  }, [pushLog]);

  /* deep link + Esc + palette commands */
  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (L1[hash]) {
      const t = setTimeout(() => setExpanded(hash), 0);
      timers.current.push(t);
    }
    const onKey = (e) => {
      if (e.key === "Escape") setExpanded(null);
    };
    const onCmd = (e) => {
      const { cmd, stage } = e.detail || {};
      if (cmd === "run-txn") runTxn();
      if (cmd === "stage" && L1[stage]) {
        setExpanded(stage);
        document.querySelector(".dg-l0")?.scrollIntoView({ block: "center" });
      }
    };
    addEventListener("keydown", onKey);
    addEventListener("dg:cmd", onCmd);
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener("dg:cmd", onCmd);
    };
  }, [runTxn]);

  const toggle = (id) => {
    const next = expanded === id ? null : id;
    setExpanded(next);
    history.replaceState(null, "", next ? `#${next}` : location.pathname);
  };

  const stageNode = (s, vertical, i) => {
    const geoH = { y: s.kind === "terminal" ? 76 : 72, h: s.kind === "terminal" ? 40 : 48 };
    const geoV = { x: s.kind === "terminal" ? 110 : 90, w: s.kind === "terminal" ? 140 : 180 };
    return (
      <g key={s.id} onClick={() => toggle(s.id)}>
        <Node
          x={vertical ? geoV.x : s.x}
          y={vertical ? 24 + i * 84 + (s.kind === "terminal" ? 4 : 0) : geoH.y}
          w={vertical ? geoV.w : s.w}
          h={vertical ? (s.kind === "terminal" ? 40 : 48) : geoH.h}
          kind={s.kind}
          title={s.title}
          detail={`${s.detail} Enter opens the detail sheet.`}
        />
      </g>
    );
  };

  return (
    <div>
      {/* L0 — desktop */}
      <div className="dg-l0 hidden sm:block" data-offline={offline || undefined}>
        <Diagram
          viewBox="0 0 960 190"
          label="Live diagram: a payment travels from tap, through devices in the field and the cloud, to settled. Each stage opens a detail sheet."
          className="dg-hero"
          readoutDefault="Probe a stage — hover or Tab. Enter opens its internals."
          caption="Fig. 1 — Life of a transaction."
        >
          <Ticks x1={116} x2={844} y={172} n={14} />
          <Bus d="M116 96 H190" />
          <Bus d="M330 96 H400" />
          <Bus d="M540 96 H610" />
          <Bus d="M750 96 H844" />
          <Bus d={H_RETURN} hot={false} />
          {/* observability rail: dim telemetry taps from every stage */}
          <g className="dg-rail" aria-hidden="true">
            <path className="dg-bus" d={RAIL} />
            {[240, 470, 680].map((x) => (
              <path key={x} className="dg-bus dg-tap" d={`M${x} 120 V150`} />
            ))}
            <text x={796} y={153} fontSize="8.5" className="dg-raillabel">TELEMETRY</text>
          </g>

          <g className="dg-under" aria-hidden="true">
            <Packet path={H_MAIN} dur={7} delay={-0.5} />
            <Packet path={H_MAIN} dur={7} delay={-2.9} />
            <Packet path={H_MAIN} dur={7} delay={-5.2} hue="white" />
            <Packet path={H_RETURN} dur={5.5} delay={-1.6} hue="green" r={2.5} />
            <Packet path={H_RETURN} dur={9} delay={-6.2} hue="ring" r={3} />
            <Packet path={RAIL} dur={8} delay={-1.1} hue="dash" />
            <Packet path={RAIL} dur={8} delay={-5} hue="dash" />
            {sims.map((id) => (
              <circle key={id} className="dg-packet dg-packet-sim" r="4"
                style={{ offsetPath: `path("${H_MAIN}")` }} />
            ))}
            {offline ? (
              <g className="dg-queue">
                {[0, 1, 2, 3].map((i) => (
                  <circle key={i} cx={452 + i * 11} cy={126} r="3" style={{ animationDelay: `${i * 0.5}s` }} />
                ))}
              </g>
            ) : null}
          </g>

          {STAGES.map((s, i) => stageNode(s, false, i))}
        </Diagram>
      </div>

      {/* L0 — mobile vertical */}
      <div className="dg-l0 sm:hidden" data-offline={offline || undefined}>
        <Diagram
          viewBox="0 0 360 460"
          label="Live diagram: a payment travels from tap, through devices in the field and the cloud, to settled. Tap a stage to open its detail sheet."
          className="dg-hero"
          readoutDefault="Tap a stage — its internals unfold below."
          caption="Fig. 1 — Life of a transaction."
        >
          <Bus d={V_MAIN} />
          <g className="dg-under" aria-hidden="true">
            <Packet path={V_MAIN} dur={6.5} delay={-0.5} />
            <Packet path={V_MAIN} dur={6.5} delay={-3.4} hue="white" />
          </g>
          {STAGES.map((s, i) => stageNode(s, true, i))}
        </Diagram>
      </div>

      {/* legend + controls + sparkline */}
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        <button type="button" onClick={runTxn} className="btn !py-2 !px-4 !text-[0.7rem]">
          Run txn
        </button>
        <ul className="tag flex flex-wrap items-center gap-x-5 gap-y-1 text-muted" aria-label="Packet legend — all values simulated">
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-amber" /> auth
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="inline-block h-0.5 w-3 bg-arc" /> telemetry
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full border-2 border-amber" /> decline / retry
          </li>
          <li>simulated</li>
        </ul>
        <div className="tag flex items-center gap-2 text-muted" aria-label="Simulated packet rate from this page's animation">
          <svg viewBox="0 0 96 24" className="h-5 w-20" aria-hidden="true">
            <polyline
              points={spark.map((v, i) => `${4 + i * 8},${21 - v * 1.9}`).join(" ")}
              fill="none" stroke="var(--amber)" strokeWidth="1.5"
            />
          </svg>
          pkts · sim
        </div>
      </div>

      {/* event log */}
      <div className="mono mt-3 min-h-[4.4rem] rounded-sm border border-line bg-well px-4 py-2.5 text-[0.72rem] leading-relaxed text-muted"
           role="log" aria-label="Simulated event log">
        <span className="sr-only">Simulated event log of the diagram above.</span>
        {log.length === 0 ? <p>— event log · run a transaction —</p> : null}
        {log.map((l, i) => (
          <p key={`${l}-${i}`} style={{ opacity: 0.78 + (i / Math.max(1, log.length - 1)) * 0.22 }}>{l}</p>
        ))}
      </div>

      {/* L1 detail sheet */}
      {expanded ? (
        <section className="mx-auto mt-8 max-w-md" aria-label={L1[expanded].heading}>
          <div className="flex items-center justify-between gap-4">
            <h3 className="tag text-amber">{L1[expanded].heading}</h3>
            <button type="button" onClick={() => toggle(expanded)} className="btn-ghost !px-3 !py-1.5 !text-[0.7rem]">
              Close · Esc
            </button>
          </div>
          <Diagram
            viewBox={`0 0 360 ${70 + L1[expanded].nodes.length * 64}`}
            label={`Detail: ${L1[expanded].heading}`}
            className="dg-case mt-3"
            readoutDefault={L1[expanded].note}
          >
            <Bus d={`M180 24 V${40 + L1[expanded].nodes.length * 64}`} />
            <g className="dg-under" aria-hidden="true">
              <Packet path={`M180 24 V${40 + L1[expanded].nodes.length * 64}`} dur={5} delay={-1} />
              <Packet path={`M180 24 V${40 + L1[expanded].nodes.length * 64}`} dur={5} delay={-3.4} hue="dash" />
            </g>
            {L1[expanded].nodes.map((n, i) => (
              <Node key={n} x={70} y={40 + i * 64} w={220} h={44} title={n} titleSize={10.5}
                detail={`${n.charAt(0) + n.slice(1).toLowerCase()} — one of the ${L1[expanded].nodes.length} subsystems in this stage.`} />
            ))}
          </Diagram>
        </section>
      ) : null}

      {/* title block — the name's home */}
      <div className="mono mt-8 ml-auto w-fit max-w-full border border-line text-[0.72rem] leading-tight text-muted">
        <div className="grid grid-cols-[auto_auto] sm:grid-cols-[auto_auto_auto_auto]">
          <div className="border-b border-r border-line px-3 py-1.5 sm:border-b-0">
            <span className="block text-[0.7rem] tracking-[0.18em] opacity-70">TITLE</span>
            FUEL TRANSACTION PIPELINE
          </div>
          <div className="border-b border-line px-3 py-1.5 sm:border-b-0 sm:border-r">
            <span className="block text-[0.7rem] tracking-[0.18em] opacity-70">DRAWN BY</span>
            <span className="text-fg">ROHITH VARMA VEGESNA</span>
          </div>
          <div className="border-r border-line px-3 py-1.5">
            <span className="block text-[0.7rem] tracking-[0.18em] opacity-70">REV</span>9
          </div>
          <div className="px-3 py-1.5">
            <span className="block text-[0.7rem] tracking-[0.18em] opacity-70">SHEET · DATE</span>
            1/1 · {buildDate}
          </div>
        </div>
      </div>
    </div>
  );
}
