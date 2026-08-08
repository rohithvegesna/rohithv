"use client";

import { useEffect, useRef, useState } from "react";

/*
  Signature build — the edge-to-cloud net drawn as a routed board.
  45°-chamfered copper traces, vias at layer changes, IC footprints with
  pin-1 dots and REF designators. A current packet travels the main net
  (drawn UNDER the components, so it vanishes inside each chip and
  re-emerges on the far pin — the way a signal actually would).

  Probe it: every component is keyboard-focusable; Enter/Space (or click)
  reads out what that stage does. Animation pauses offscreen and on hidden
  tabs; under prefers-reduced-motion the net renders energized and still.
*/

const READOUTS = {
  j1: "J1 · DEVICE 01 — field unit. Senses, actuates, and reports; keeps working when the link doesn't.",
  j2: "J2 · DEVICE 02 — same footprint, different site. Fleets are made of repeats.",
  j3: "J3 · DEVICE 03 — the interesting one: it went quiet once. Silence is a signal too.",
  u1: "U1 · EDGE GATEWAY — buffers store-and-forward and retries the uplink until the cloud acks.",
  u2: "U2 · MESSAGE BROKER — fan-in point. Every device authenticates before a single byte is accepted.",
  u3: "U3 · STREAM PROCESSOR — turns raw telemetry into decisions while it's still moving.",
  u4: "U4 · DATA STORE — hot state for now, history for later. Idempotent writes only.",
  j4: "J4 · OPS — alarms and dashboards. Built for the absence of signal, not just the presence of errors.",
};

const HINT = "Probe the net — click a component, or Tab + Enter.";

function Node({
  id,
  x,
  y,
  w,
  h,
  refDes,
  title,
  sub,
  titleSize = 12,
  active,
  onProbe,
}) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  return (
    <g
      className="sch-node cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label={`Probe ${refDes} ${title}`}
      aria-pressed={active}
      data-active={active}
      onClick={() => onProbe(id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onProbe(id);
        }
      }}
    >
      <rect x={x} y={y} width={w} height={h} rx="2" strokeWidth="1.25" />
      {/* pin-1 dot */}
      <circle cx={x + 9} cy={y + 9} r="2.5" fill="var(--copper)" />
      {/* status LED */}
      <circle
        className={`sch-led ${id === "j4" ? "sch-led-always" : ""}`}
        cx={x + w - 10}
        cy={y + 10}
        r="3"
        fill="var(--led-off)"
      />
      <text
        x={x}
        y={y - 6}
        fontSize="10"
        letterSpacing="1"
        fill="var(--silk-faint)"
        fontWeight="700"
      >
        {refDes}
      </text>
      <text
        x={cx}
        y={sub ? cy - 2 : cy + 4}
        textAnchor="middle"
        fontSize={titleSize}
        letterSpacing="1.2"
        fill="var(--silk)"
        fontWeight="600"
      >
        {title}
      </text>
      {sub ? (
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          fontSize="8.5"
          letterSpacing="1"
          fill="var(--silk-muted)"
        >
          {sub}
        </text>
      ) : null}
    </g>
  );
}

function Via({ x, y }) {
  return (
    <g>
      <circle cx={x} cy={y} r="5" fill="var(--copper)" />
      <circle cx={x} cy={y} r="2" fill="var(--substrate-3)" />
    </g>
  );
}

const H_MAIN =
  "M136 150 H430 L446 134 V98 L462 82 H575 V150 H740";
const V_MAIN = "M180 64 V496";

export default function Schematic() {
  const [activeId, setActiveId] = useState(null);
  const figRef = useRef(null);

  useEffect(() => {
    const fig = figRef.current;
    if (!fig) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        fig.classList.toggle("paused", !entry.isIntersecting);
        if (entry.isIntersecting) fig.classList.add("energized");
      },
      { threshold: 0.15 }
    );
    io.observe(fig);
    const onVis = () =>
      fig.classList.toggle("paused", document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const probe = (id) => setActiveId((cur) => (cur === id ? null : id));

  const nodeProps = (id) => ({ id, active: activeId === id, onProbe: probe });

  return (
    <figure
      ref={figRef}
      className="sch-figure"
      aria-label="Schematic: field devices connect to an edge gateway, which streams through a cloud message broker, stream processor, and data store to operations dashboards and alarms"
    >
      {/* Horizontal — ≥ sm */}
      <svg
        viewBox="0 0 840 300"
        className="hidden w-full sm:block"
        role="group"
        aria-label="Edge-to-cloud net. Each component can be probed."
        style={{ fontFamily: "var(--font-overpass-mono), monospace" }}
      >
        {/* current packet runs UNDER the components */}
        <g aria-hidden="true">
          <path className="sch-trace-hot" d={H_MAIN} />
          <circle
            className="sch-packet"
            r="3.5"
            style={{
              offsetPath: `path("${H_MAIN}")`,
              animation: "travel 5.2s linear infinite",
            }}
          />
        </g>

        {/* branch traces */}
        <g aria-hidden="true">
          <path className="sch-trace" d="M136 51 H168 L176 59 V118 L184 126 H220" />
          <path className="sch-trace" d="M136 150 H220" />
          <path className="sch-trace" d="M136 249 H168 L176 241 V182 L184 174 H220" />
          <path className="sch-trace" d="M380 150 H430 L446 134 V98 L462 82 H486" />
          <path className="sch-trace" d="M575 100 V132" />
          <path className="sch-trace" d="M575 168 V200" />
          <path className="sch-trace" d="M664 150 H724" />
          <Via x={176} y={88} />
          <Via x={176} y={212} />
          <Via x={446} y={116} />
          <text
            x={425}
            y={172}
            textAnchor="middle"
            fontSize="9"
            letterSpacing="1.5"
            fill="var(--silk-muted)"
          >
            MQTT / TLS
          </text>
        </g>

        {/* cloud keepout */}
        <g aria-hidden="true">
          <rect
            x={470}
            y={40}
            width={210}
            height={220}
            fill="none"
            stroke="var(--silk-faint)"
            strokeDasharray="5 5"
          />
          <rect x={476} y={47} width={48} height={15} fill="var(--substrate)" />
          <text
            x={482}
            y={58}
            fontSize="9"
            letterSpacing="2"
            fill="var(--gold)"
            fontWeight="700"
          >
            CLOUD
          </text>
        </g>

        <Node {...nodeProps("j1")} x={16} y={28} w={120} h={46} refDes="J1" title="DEVICE 01" sub="SENSE · ACTUATE" titleSize={10.5} />
        <Node {...nodeProps("j2")} x={16} y={127} w={120} h={46} refDes="J2" title="DEVICE 02" sub="SENSE · ACTUATE" titleSize={10.5} />
        <Node {...nodeProps("j3")} x={16} y={226} w={120} h={46} refDes="J3" title="DEVICE 03" sub="SENSE · ACTUATE" titleSize={10.5} />
        <Node {...nodeProps("u1")} x={220} y={110} w={160} h={80} refDes="U1" title="EDGE GATEWAY" sub="BUFFER · RETRY" />
        <Node {...nodeProps("u2")} x={486} y={64} w={178} h={36} refDes="U2" title="MESSAGE BROKER" titleSize={10.5} />
        <Node {...nodeProps("u3")} x={486} y={132} w={178} h={36} refDes="U3" title="STREAM PROCESSOR" titleSize={10.5} />
        <Node {...nodeProps("u4")} x={486} y={200} w={178} h={36} refDes="U4" title="DATA STORE" titleSize={10.5} />
        <Node {...nodeProps("j4")} x={724} y={118} w={100} h={64} refDes="J4" title="OPS" sub="ALARMS · DASH" />
      </svg>

      {/* Vertical — < sm */}
      <svg
        viewBox="0 0 360 560"
        className="w-full sm:hidden"
        role="group"
        aria-label="Edge-to-cloud net. Each component can be probed."
        style={{ fontFamily: "var(--font-overpass-mono), monospace" }}
      >
        <g aria-hidden="true">
          <path className="sch-trace-hot" d={V_MAIN} />
          <circle
            className="sch-packet"
            r="3.5"
            style={{
              offsetPath: `path("${V_MAIN}")`,
              animation: "travel 4.6s linear infinite",
            }}
          />
        </g>

        <g aria-hidden="true">
          <path className="sch-trace" d="M72 64 V90 L80 98 H132 L140 106 V120" />
          <path className="sch-trace" d="M180 64 V120" />
          <path className="sch-trace" d="M288 64 V90 L280 98 H228 L220 106 V120" />
          <path className="sch-trace" d="M180 184 V256" />
          <path className="sch-trace" d="M180 292 V316" />
          <path className="sch-trace" d="M180 352 V376" />
          <path className="sch-trace" d="M180 412 V496" />
          <Via x={106} y={98} />
          <Via x={254} y={98} />
          <Via x={180} y={220} />
          <text
            x={192}
            y={224}
            fontSize="9"
            letterSpacing="1.5"
            fill="var(--silk-muted)"
          >
            MQTT / TLS
          </text>
        </g>

        <g aria-hidden="true">
          <rect
            x={44}
            y={232}
            width={272}
            height={240}
            fill="none"
            stroke="var(--silk-faint)"
            strokeDasharray="5 5"
          />
          <rect x={50} y={239} width={48} height={15} fill="var(--substrate)" />
          <text
            x={56}
            y={250}
            fontSize="9"
            letterSpacing="2"
            fill="var(--gold)"
            fontWeight="700"
          >
            CLOUD
          </text>
        </g>

        <Node {...nodeProps("j1")} x={22} y={20} w={100} h={44} refDes="J1" title="DEV 01" sub="SENSE" titleSize={10.5} />
        <Node {...nodeProps("j2")} x={130} y={20} w={100} h={44} refDes="J2" title="DEV 02" sub="SENSE" titleSize={10.5} />
        <Node {...nodeProps("j3")} x={238} y={20} w={100} h={44} refDes="J3" title="DEV 03" sub="SENSE" titleSize={10.5} />
        <Node {...nodeProps("u1")} x={80} y={120} w={200} h={64} refDes="U1" title="EDGE GATEWAY" sub="BUFFER · RETRY" />
        <Node {...nodeProps("u2")} x={64} y={256} w={232} h={36} refDes="U2" title="MESSAGE BROKER" titleSize={10.5} />
        <Node {...nodeProps("u3")} x={64} y={316} w={232} h={36} refDes="U3" title="STREAM PROCESSOR" titleSize={10.5} />
        <Node {...nodeProps("u4")} x={64} y={376} w={232} h={36} refDes="U4" title="DATA STORE" titleSize={10.5} />
        <Node {...nodeProps("j4")} x={80} y={496} w={200} h={48} refDes="J4" title="OPS" sub="ALARMS · DASH" />
      </svg>

      <div
        role="status"
        aria-live="polite"
        className="mt-4 min-h-[3.2rem] border-l-2 border-copper py-1 pl-4 font-mono text-sm leading-relaxed text-silk-muted"
      >
        {activeId ? READOUTS[activeId] : HINT}
      </div>

      <figcaption className="silk-label mt-3 text-silk-muted">
        Fig. 01 — Edge-to-cloud telemetry, the shape of the systems I build
      </figcaption>
    </figure>
  );
}
