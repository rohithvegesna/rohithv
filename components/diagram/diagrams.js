"use client";

/* Every diagram on the site, built from the library. All labels are generic
   industry terms — never internal system names. */

import { Diagram, Node, Bus, Packet, Region, Ticks, StateGlyph } from "./lib";

/* ---------------- DG1 — hero: life of a transaction ---------------- */

const H_MAIN =
  "M116 130 H548 L564 114 V92 H684 V172 H818 L834 156 V130 H850";
const H_RETURN = "M684 86 H570 L554 102 V124 H300";
const V_MAIN = "M180 44 V500";

export function HeroTrace() {
  return (
    <Diagram
      viewBox="0 0 960 260"
      label="Live diagram: a fuel transaction travels from card tap through the EMV dispenser, store controller, and payment host to settlement"
      className="dg-hero hidden sm:block"
      readoutDefault="Probe a stage — hover or Tab."
      caption="Fig. 1 — Life of a transaction: tap to settlement."
    >
      <Ticks x1={116} x2={850} y={242} n={14} />
      <Bus d="M116 130 H170" />
      <Bus d="M300 130 H360" />
      <Bus d="M510 130 H548 L564 114 V92 H584" />
      <Bus d="M684 114 V150" />
      <Bus d="M784 172 H818 L834 156 V130 H850" />
      <Bus d={H_RETURN} hot={false} />

      <g className="dg-under" aria-hidden="true">
        <Packet path={H_MAIN} dur={7} delay={-0.5} />
        <Packet path={H_MAIN} dur={7} delay={-2.9} />
        <Packet path={H_MAIN} dur={7} delay={-5.2} hue="white" />
        <Packet path={H_RETURN} dur={5.5} delay={-1.6} hue="green" r={2.5} />
      </g>

      <Node x={16} y={110} w={100} h={40} kind="terminal" title="CARD TAP"
        detail="Contactless EMV — the six seconds of trust the whole pipeline exists to honor." />
      <Node x={170} y={98} w={130} h={64} title="DISPENSER" sub="EMV KERNEL"
        detail="A payment terminal bolted to a pump — kernel, state machine, and byte-level protocol at the edge." />
      <Node x={360} y={98} w={150} h={64} title="STORE CONTROLLER" sub="STATE MACHINES"
        detail="The site brain: buffers store-and-forward, retries the uplink, keeps fueling through dropped links." />
      <Region x={560} y={40} w={250} h={180} tag="CLOUD" />
      <Node x={584} y={70} w={200} h={44} kind="cloud" title="PAYMENT HOST"
        detail="Authorizes in milliseconds; idempotency keys make retries safe when links flap." />
      <Node x={584} y={150} w={200} h={44} kind="cloud" title="LEDGER"
        detail="Hot state now, history forever — reconciliation runs as a stream, not a back office." />
      <Node x={850} y={110} w={94} h={40} kind="terminal" title="SETTLE"
        detail="Batch close: the day's fuel becomes money. Boring on purpose." />

      <StateGlyph x={190} y={186} label="AUTH OK" period={7} delay={-1.2} />
    </Diagram>
  );
}

export function HeroTraceMobile() {
  return (
    <Diagram
      viewBox="0 0 360 540"
      label="Live diagram: a fuel transaction travels from card tap through the EMV dispenser, store controller, and payment host to settlement"
      className="dg-hero sm:hidden"
      readoutDefault="Probe a stage — tap a node."
      caption="Fig. 1 — Life of a transaction: tap to settlement."
    >
      <Bus d="M180 44 V500" />
      <g className="dg-under" aria-hidden="true">
        <Packet path={V_MAIN} dur={6.5} delay={-0.5} />
        <Packet path={V_MAIN} dur={6.5} delay={-3.4} hue="white" />
      </g>
      <Node x={110} y={24} w={140} h={40} kind="terminal" title="CARD TAP"
        detail="Contactless EMV — the six seconds of trust the whole pipeline exists to honor." />
      <Node x={80} y={108} w={200} h={56} title="DISPENSER" sub="EMV KERNEL"
        detail="A payment terminal bolted to a pump — kernel, state machine, and byte-level protocol at the edge." />
      <Node x={80} y={204} w={200} h={56} title="STORE CONTROLLER" sub="STATE MACHINES" titleSize={10.5}
        detail="The site brain: buffers store-and-forward, retries the uplink, keeps fueling through dropped links." />
      <Region x={48} y={296} w={264} h={140} tag="CLOUD" />
      <Node x={80} y={316} w={200} h={44} kind="cloud" title="PAYMENT HOST"
        detail="Authorizes in milliseconds; idempotency keys make retries safe when links flap." />
      <Node x={80} y={376} w={200} h={44} kind="cloud" title="LEDGER"
        detail="Hot state now, history forever — reconciliation runs as a stream, not a back office." />
      <Node x={110} y={470} w={140} h={40} kind="terminal" title="SETTLE"
        detail="Batch close: the day's fuel becomes money. Boring on purpose." />
    </Diagram>
  );
}

/* ---------------- case figures (portrait, one variant, legible at 360) ---------------- */

function CaseDiagram({ label, caption, children, viewH = 480 }) {
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

const P1 = "M180 40 V440";
export function FigPlatform() {
  return (
    <CaseDiagram
      label="Architecture: dispensers connect through a store controller to cloud ingestion, streaming, and storage"
      caption="Fig. 1 — One contract from forecourt to fleet."
    >
      <Bus d={P1} />
      <Bus d="M96 84 V110 L112 126 H140" hot={false} />
      <Bus d="M264 84 V110 L248 126 H220" hot={false} />
      <g className="dg-under" aria-hidden="true">
        <Packet path={P1} dur={6} delay={-0.4} />
        <Packet path={P1} dur={6} delay={-3.2} hue="white" />
      </g>
      <Region x={24} y={20} w={312} h={64} tag="FORECOURT" />
      <Node x={40} y={36} w={112} h={40} title="DISPENSER" titleSize={10}
        detail="Heterogeneous hardware, one contract — every pump state is a first-class transition." />
      <Node x={208} y={36} w={112} h={40} title="DISPENSER" titleSize={10}
        detail="Heterogeneous hardware, one contract — every pump state is a first-class transition." />
      <Node x={80} y={126} w={200} h={52} title="STORE CONTROLLER" sub="STORE-AND-FORWARD" titleSize={10.5}
        detail="A dropped link degrades to delayed telemetry, never to lost transactions." />
      <Region x={48} y={210} w={264} h={196} tag="CLOUD" />
      <Node x={80} y={230} w={200} h={42} kind="cloud" title="IOT GATEWAY"
        detail="Per-device identity over MQTT — nothing anonymous gets a byte in." />
      <Node x={80} y={288} w={200} h={42} kind="cloud" title="STREAM"
        detail="Telemetry fans into stream processing while it is still moving." />
      <Node x={80} y={346} w={200} h={42} kind="cloud" title="STORE"
        detail="Hot state and operational history, written idempotently." />
      <Node x={110} y={420} w={140} h={38} kind="terminal" title="OPS"
        detail="Commands flow back down with explicit acks — a maybe-applied command is worse than a failed one." />
    </CaseDiagram>
  );
}

const P2 = "M180 40 V440";
export function FigPXE() {
  return (
    <CaseDiagram
      label="Pipeline: a factory-fresh device network-boots, streams an image, validates, and comes out sealed"
      caption="Fig. 1 — Plug in, walk away: the imaging line."
    >
      <Bus d={P2} />
      <g className="dg-under" aria-hidden="true">
        <Packet path={P2} dur={6.5} delay={-0.8} />
        <Packet path={P2} dur={6.5} delay={-4} hue="white" />
      </g>
      <Node x={110} y={24} w={140} h={38} kind="terminal" title="POWER ON"
        detail="No keyboard, no USB stick, no human — the bench does the rest." />
      <Node x={80} y={100} w={200} h={44} title="DHCP / PXE"
        detail="The device asks the network who it is; hardware identity picks the image." />
      <Node x={80} y={172} w={200} h={44} title="BOOTLOADER" sub="TFTP"
        detail="A tiny loader arrives over the wire and takes it from there." />
      <Node x={80} y={244} w={200} h={44} title="IMAGE STREAM"
        detail="The OS and device-specific config stream straight onto the appliance." />
      <Node x={80} y={316} w={200} h={44} title="VALIDATE"
        detail="Every unit passes the same gate — known-good, not assumed-good." />
      <Node x={110} y={402} w={140} h={38} kind="terminal" title="SEALED"
        detail="What leaves the bench is fleet-ready payment hardware." />
      <StateGlyph x={292} y={338} label="PASS" period={6.5} delay={-2} />
    </CaseDiagram>
  );
}

const P3 = "M180 40 V440";
export function FigBooking() {
  return (
    <CaseDiagram
      label="Flow: a search fans out to supplier APIs, locks a price, authorizes payment, then confirms the booking"
      caption="Fig. 1 — Charged without a room is not a state."
    >
      <Bus d={P3} />
      <Bus d="M112 218 H80 V196" hot={false} />
      <Bus d="M248 218 H280 V196" hot={false} />
      <g className="dg-under" aria-hidden="true">
        <Packet path={P3} dur={6.5} delay={-0.6} hue="white" />
        <Packet path={P3} dur={6.5} delay={-3.6} />
      </g>
      <Node x={110} y={24} w={140} h={38} kind="terminal" title="SEARCH"
        detail="One app, both stores, live inventory." />
      <Node x={80} y={100} w={200} h={44} title="AGGREGATOR"
        detail="Supplier chaos normalized into one internal shape, cached where terms allow." />
      <Region x={28} y={170} w={304} h={78} tag="SUPPLIERS" />
      <Node x={44} y={186} w={104} h={40} title="API A" titleSize={10}
        detail="Price and availability that disagree with themselves between search and checkout." />
      <Node x={212} y={186} w={104} h={40} title="API B" titleSize={10}
        detail="Price and availability that disagree with themselves between search and checkout." />
      <Node x={80} y={272} w={200} h={44} title="PRICE LOCK"
        detail="Re-verified against the supplier immediately before any money moves." />
      <Node x={80} y={344} w={200} h={44} title="PAYMENT AUTH"
        detail="Held, not captured, until the supplier confirms — two-phase by design." />
      <Node x={110} y={420} w={140} h={38} kind="terminal" title="CONFIRMED"
        detail="The only failure mode is 'booking didn't happen' — never 'charged without a room'." />
    </CaseDiagram>
  );
}

const P4 = "M180 40 V440";
export function FigObservability() {
  return (
    <CaseDiagram
      label="Path: fleet telemetry rides a bus into metrics, alarm rules watch for silence, and on-call gets paged"
      caption="Fig. 1 — The dangerous failure is silence."
    >
      <Bus d={P4} />
      <Bus d="M96 84 V104 L112 120 H140" hot={false} />
      <Bus d="M264 84 V104 L248 120 H220" hot={false} />
      <g className="dg-under" aria-hidden="true">
        <Packet path={P4} dur={6} delay={-1} />
        <Packet path={P4} dur={6} delay={-3.8} hue="white" />
      </g>
      <Region x={24} y={20} w={312} h={64} tag="FLEET" />
      <Node x={40} y={36} w={112} h={40} title="DEVICE 01" titleSize={10}
        detail="Emits structured metrics from the logs it already writes — instrumentation costs a log line." />
      <Node x={208} y={36} w={112} h={40} title="DEVICE 02" titleSize={10}
        detail="This one went quiet once. Silence is a signal too." />
      <Node x={80} y={120} w={200} h={44} title="TELEMETRY BUS"
        detail="No new agents on constrained edges — the pipeline that exists carries the metrics." />
      <Node x={80} y={192} w={200} h={44} kind="cloud" title="METRICS STORE"
        detail="Per site, per device type, fleet-wide — one system, three questions." />
      <Node x={80} y={264} w={200} h={44} kind="cloud" title="ALARM RULES" sub="HEARTBEAT EXPECTED"
        detail="Inverted alarms: fire on the absence of expected telemetry, scoped so one dead link is one incident." />
      <Node x={110} y={402} w={140} h={38} kind="terminal" title="ON-CALL"
        detail="Every alarm is one a human should act on — alert fatigue is the failure mode of monitoring." />
      <Bus d="M180 308 V402" />
      <StateGlyph x={288} y={286} label="SILENT" hue="amber" period={9} delay={-5} />
      <StateGlyph x={288} y={420} label="PAGED" period={9} delay={-4.6} />
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
      <g className="dg-fault" aria-hidden="true">
        <path d="M322 108 L346 132 M346 108 L322 132" />
        <text x={350} y={158} textAnchor="end" fontSize="9">
          NO ROUTE TO HOST
        </text>
      </g>
    </Diagram>
  );
}
