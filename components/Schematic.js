/*
  Ambient hero art — the edge-to-cloud net as a routed board. Pure
  decoration now: no interaction required, nothing withheld. 45°-chamfered
  copper traces, vias at layer changes, a current packet that travels the
  main net underneath the components. Hover highlights are an optional
  accelerator only. Pause/energize handled by the Current driver; under
  reduced motion the net renders energized and still.
*/

function Node({ x, y, w, h, title, sub, titleSize = 12 }) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  return (
    <g className="sch-node">
      <rect x={x} y={y} width={w} height={h} rx="2" strokeWidth="1.25" />
      <circle cx={x + 9} cy={y + 9} r="2.5" fill="var(--copper)" />
      <circle
        className="sch-led"
        cx={x + w - 10}
        cy={y + 10}
        r="3"
        fill="var(--led-off)"
      />
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

const H_MAIN = "M136 150 H430 L446 134 V98 L462 82 H575 V150 H740";
const V_MAIN = "M180 64 V496";

export default function Schematic() {
  return (
    <figure className="sch-figure" aria-label="Decorative schematic: field devices connect through an edge gateway and cloud pipeline to operations">
      {/* Horizontal — ≥ sm */}
      <svg
        viewBox="0 0 840 300"
        className="hidden w-full sm:block"
        aria-hidden="true"
        style={{ fontFamily: "var(--font-overpass-mono), monospace" }}
      >
        <g>
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

        <g>
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

        <g>
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

        <Node x={16} y={28} w={120} h={46} title="DEVICE 01" sub="SENSE · ACTUATE" titleSize={10.5} />
        <Node x={16} y={127} w={120} h={46} title="DEVICE 02" sub="SENSE · ACTUATE" titleSize={10.5} />
        <Node x={16} y={226} w={120} h={46} title="DEVICE 03" sub="SENSE · ACTUATE" titleSize={10.5} />
        <Node x={220} y={110} w={160} h={80} title="EDGE GATEWAY" sub="BUFFER · RETRY" />
        <Node x={486} y={64} w={178} h={36} title="MESSAGE BROKER" titleSize={10.5} />
        <Node x={486} y={132} w={178} h={36} title="STREAM PROCESSOR" titleSize={10.5} />
        <Node x={486} y={200} w={178} h={36} title="DATA STORE" titleSize={10.5} />
        <Node x={724} y={118} w={100} h={64} title="OPS" sub="ALARMS · DASH" />
      </svg>

      {/* Vertical — < sm */}
      <svg
        viewBox="0 0 360 560"
        className="w-full sm:hidden"
        aria-hidden="true"
        style={{ fontFamily: "var(--font-overpass-mono), monospace" }}
      >
        <g>
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

        <g>
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

        <g>
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

        <Node x={22} y={20} w={100} h={44} title="DEV 01" sub="SENSE" titleSize={10.5} />
        <Node x={130} y={20} w={100} h={44} title="DEV 02" sub="SENSE" titleSize={10.5} />
        <Node x={238} y={20} w={100} h={44} title="DEV 03" sub="SENSE" titleSize={10.5} />
        <Node x={80} y={120} w={200} h={64} title="EDGE GATEWAY" sub="BUFFER · RETRY" />
        <Node x={64} y={256} w={232} h={36} title="MESSAGE BROKER" titleSize={10.5} />
        <Node x={64} y={316} w={232} h={36} title="STREAM PROCESSOR" titleSize={10.5} />
        <Node x={64} y={376} w={232} h={36} title="DATA STORE" titleSize={10.5} />
        <Node x={80} y={496} w={200} h={48} title="OPS" sub="ALARMS · DASH" />
      </svg>

      <figcaption className="silk-label mt-4 text-silk-muted">
        Fig. 01 — Edge-to-cloud telemetry, the shape of the systems I build
      </figcaption>
    </figure>
  );
}
