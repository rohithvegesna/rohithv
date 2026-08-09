"use client";

/* Every diagram on the site, built from the library. Deliberately abstract:
   high-level stages only — no protocols, no internals, no operational
   specifics. The craft is in the language, not the disclosure. */

import { Diagram, Node, Bus, Packet, Region, Ticks } from "./lib";

/* ---------------- DG1 — hero: life of a transaction ---------------- */

const H_MAIN = "M116 96 H844";
const H_RETURN = "M700 82 H300";
const V_MAIN = "M180 44 V420";

export function HeroTrace() {
  return (
    <Diagram
      viewBox="0 0 960 190"
      label="Live diagram: a payment travels from tap, through devices in the field and the cloud, to settled"
      className="dg-hero hidden sm:block"
      readoutDefault="Probe a stage — hover or Tab."
      caption="Fig. 1 — Life of a transaction."
    >
      <Ticks x1={116} x2={844} y={168} n={14} />
      <Bus d="M116 96 H190" />
      <Bus d="M330 96 H400" />
      <Bus d="M540 96 H610" />
      <Bus d="M750 96 H844" />
      <Bus d={H_RETURN} hot={false} />

      <g className="dg-under" aria-hidden="true">
        <Packet path={H_MAIN} dur={7} delay={-0.5} />
        <Packet path={H_MAIN} dur={7} delay={-2.9} />
        <Packet path={H_MAIN} dur={7} delay={-5.2} hue="white" />
        <Packet path={H_RETURN} dur={5.5} delay={-1.6} hue="green" r={2.5} />
      </g>

      <Node x={16} y={76} w={100} h={40} kind="terminal" title="TAP"
        detail="Where a payment begins." />
      <Node x={190} y={72} w={140} h={48} title="DEVICE"
        detail="Hardware in the field, built to keep working." />
      <Node x={400} y={72} w={140} h={48} title="SITE"
        detail="Every location stays connected." />
      <Node x={610} y={72} w={140} h={48} kind="cloud" title="CLOUD"
        detail="Where the whole fleet comes together." />
      <Node x={844} y={76} w={100} h={40} kind="terminal" title="SETTLED"
        detail="Done, and accounted for." />
    </Diagram>
  );
}

export function HeroTraceMobile() {
  return (
    <Diagram
      viewBox="0 0 360 460"
      label="Live diagram: a payment travels from tap, through devices in the field and the cloud, to settled"
      className="dg-hero sm:hidden"
      readoutDefault="Probe a stage — tap a node."
      caption="Fig. 1 — Life of a transaction."
    >
      <Bus d="M180 44 V420" />
      <g className="dg-under" aria-hidden="true">
        <Packet path={V_MAIN} dur={6.5} delay={-0.5} />
        <Packet path={V_MAIN} dur={6.5} delay={-3.4} hue="white" />
      </g>
      <Node x={110} y={24} w={140} h={40} kind="terminal" title="TAP"
        detail="Where a payment begins." />
      <Node x={90} y={108} w={180} h={48} title="DEVICE"
        detail="Hardware in the field, built to keep working." />
      <Node x={90} y={192} w={180} h={48} title="SITE"
        detail="Every location stays connected." />
      <Node x={90} y={276} w={180} h={48} kind="cloud" title="CLOUD"
        detail="Where the whole fleet comes together." />
      <Node x={110} y={396} w={140} h={40} kind="terminal" title="SETTLED"
        detail="Done, and accounted for." />
    </Diagram>
  );
}

/* -------- case figures: abstract, four stages, one variant -------- */

function CaseDiagram({ label, caption, children, viewH = 400 }) {
  return (
    <Diagram
      viewBox={`0 0 360 ${viewH}`}
      label={label}
      caption={caption}
      className="dg-case"
      readoutDefault="Probe a stage — hover or Tab."
    >
      {children}
    </Diagram>
  );
}

const P = "M180 36 V364";

export function FigPlatform() {
  return (
    <CaseDiagram
      label="Diagram: devices in the field connect through each site to the cloud and operations"
      caption="Fig. 1 — From the field to the fleet."
    >
      <Bus d={P} />
      <g className="dg-under" aria-hidden="true">
        <Packet path={P} dur={6} delay={-0.4} />
        <Packet path={P} dur={6} delay={-3.2} hue="white" />
      </g>
      <Region x={40} y={16} w={280} h={72} tag="FIELD" />
      <Node x={90} y={32} w={180} h={44} title="DEVICES"
        detail="Many kinds of hardware, one way of talking to them." />
      <Node x={90} y={128} w={180} h={48} title="SITE"
        detail="Keeps running even when the connection doesn't." />
      <Node x={90} y={224} w={180} h={48} kind="cloud" title="CLOUD"
        detail="One place to see and steer everything." />
      <Node x={110} y={344} w={140} h={40} kind="terminal" title="OPS"
        detail="People, with the full picture." />
    </CaseDiagram>
  );
}

export function FigPXE() {
  return (
    <CaseDiagram
      label="Diagram: a new device boots from the network, receives its setup, and comes out ready"
      caption="Fig. 1 — Plug in, walk away."
    >
      <Bus d={P} />
      <g className="dg-under" aria-hidden="true">
        <Packet path={P} dur={6.5} delay={-0.8} />
        <Packet path={P} dur={6.5} delay={-4} hue="white" />
      </g>
      <Node x={110} y={16} w={140} h={40} kind="terminal" title="POWER ON"
        detail="No keyboard, no checklist, no human." />
      <Node x={90} y={104} w={180} h={48} title="NETWORK BOOT"
        detail="The bench recognizes the device on its own." />
      <Node x={90} y={200} w={180} h={48} title="SET UP"
        detail="Everything the device needs, applied automatically." />
      <Node x={110} y={324} w={140} h={40} kind="terminal" title="READY"
        detail="Known-good, not assumed-good." />
    </CaseDiagram>
  );
}

export function FigBooking() {
  return (
    <CaseDiagram
      label="Diagram: a search reaches travel suppliers, payment is held, and the booking confirms"
      caption="Fig. 1 — Charged without a room is not a state."
    >
      <Bus d={P} />
      <g className="dg-under" aria-hidden="true">
        <Packet path={P} dur={6.5} delay={-0.6} hue="white" />
        <Packet path={P} dur={6.5} delay={-3.6} />
      </g>
      <Node x={110} y={16} w={140} h={40} kind="terminal" title="SEARCH"
        detail="One app, live inventory." />
      <Node x={90} y={104} w={180} h={48} title="SUPPLIERS"
        detail="Many sources, one answer." />
      <Node x={90} y={200} w={180} h={48} title="PAYMENT"
        detail="Held until the booking is certain." />
      <Node x={110} y={324} w={140} h={40} kind="terminal" title="CONFIRMED"
        detail="The only failure allowed is a booking that simply didn't happen." />
    </CaseDiagram>
  );
}

export function FigObservability() {
  return (
    <CaseDiagram
      label="Diagram: the fleet reports in, signals are watched, and people get alerted"
      caption="Fig. 1 — The dangerous failure is silence."
    >
      <Bus d={P} />
      <g className="dg-under" aria-hidden="true">
        <Packet path={P} dur={6} delay={-1} />
        <Packet path={P} dur={6} delay={-3.8} hue="white" />
      </g>
      <Region x={40} y={16} w={280} h={72} tag="FLEET" />
      <Node x={90} y={32} w={180} h={44} title="DEVICES"
        detail="Thousands of them, reporting in." />
      <Node x={90} y={128} w={180} h={48} title="SIGNALS"
        detail="What arrives matters. What stops arriving matters more." />
      <Node x={90} y={224} w={180} h={48} kind="cloud" title="WATCH"
        detail="Quiet is a condition worth an alarm." />
      <Node x={110} y={344} w={140} h={40} kind="terminal" title="ON-CALL"
        detail="Only alarms a human should act on." />
    </CaseDiagram>
  );
}

const caseFigures = {
  "fuel-dispenser-platform": FigPlatform,
  "pxe-imaging-station": FigPXE,
  sevenlytravel: FigBooking,
  "fleet-observability": FigObservability,
};

/* Server pages can't index a client-module object — do the lookup here. */
export function CaseFigure({ slug }) {
  const Fig = caseFigures[slug];
  return Fig ? <Fig /> : null;
}

/* ---------------- 404 — no route to host ---------------- */

export function NoRoute() {
  return (
    <Diagram
      viewBox="0 0 360 240"
      label="Diagram: a request reaches the router and finds no route to the host"
      className="dg-case"
      readoutDefault={null}
    >
      <Bus d="M40 120 H150" />
      <Bus d="M270 120 H316" hot={false} />
      <g className="dg-under" aria-hidden="true">
        <Packet path="M40 120 H150" dur={2.6} delay={-0.6} />
      </g>
      <Node x={16} y={102} w={90} h={36} kind="terminal" title="REQUEST" titleSize={10} />
      <Node x={150} y={94} w={120} h={52} title="ROUTER" sub="LOOKUP" />
      <g className="dg-under" aria-hidden="true">
        <circle className="dg-packet dg-packet-bounce dg-packet-amber" r="3"
          style={{ offsetPath: 'path("M276 120 H310")' }} />
      </g>
      <g className="dg-fault" aria-hidden="true">
        <path d="M322 108 L346 132 M346 108 L322 132" />
        <text x={350} y={146} textAnchor="end" fontSize="9">
          TTL EXPIRED
        </text>
        <text x={350} y={160} textAnchor="end" fontSize="9">
          NO ROUTE TO HOST
        </text>
      </g>
    </Diagram>
  );
}
