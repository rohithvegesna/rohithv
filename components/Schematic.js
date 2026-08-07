/*
  Signature element: the edge-to-cloud path a fuel transaction actually takes —
  dispensers → site controller → AWS → ops. Fine strokes, instrument labels,
  packets marching along the bus (CSS animation, frozen under reduced motion).
  Two layouts: horizontal for ≥sm, vertical for narrow screens.
*/

const stroke = "var(--line)";
const flow = "var(--accent)";
const inkText = "var(--ink)";
const mutedText = "var(--muted)";
const amber = "var(--amber)";

function HNode({ x, y, w, h, title, sub, titleSize = 11 }) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="3"
        fill="var(--surface)"
        stroke={stroke}
      />
      <text
        x={x + w / 2}
        y={sub ? y + h / 2 - 3 : y + h / 2 + 4}
        textAnchor="middle"
        fontSize={titleSize}
        letterSpacing="1"
        fill={inkText}
        fontWeight="500"
      >
        {title}
      </text>
      {sub ? (
        <text
          x={x + w / 2}
          y={y + h / 2 + 13}
          textAnchor="middle"
          fontSize="8.5"
          letterSpacing="1"
          fill={mutedText}
        >
          {sub}
        </text>
      ) : null}
    </g>
  );
}

function Bus({ d }) {
  return (
    <g>
      <path d={d} fill="none" stroke={stroke} strokeWidth="1" />
      <path d={d} fill="none" stroke={flow} strokeWidth="1.5" className="flow-line" />
    </g>
  );
}

export default function Schematic() {
  return (
    <figure aria-label="Schematic: fuel dispensers connect to a site controller, which streams through AWS IoT Core, Kinesis, and DynamoDB to operations dashboards and alarms">
      {/* Horizontal — ≥ sm */}
      <svg
        viewBox="0 0 800 250"
        className="hidden w-full sm:block"
        role="img"
        aria-hidden="true"
        style={{ fontFamily: "var(--font-plex-mono), monospace" }}
      >
        <HNode x={10} y={22} w={112} h={44} title="DISPENSER 01" sub="EMV · PUMP" titleSize={10} />
        <HNode x={10} y={103} w={112} h={44} title="DISPENSER 02" sub="EMV · PUMP" titleSize={10} />
        <HNode x={10} y={184} w={112} h={44} title="DISPENSER 03" sub="EMV · PUMP" titleSize={10} />

        <Bus d="M122 44 H160 V125 H200" />
        <Bus d="M122 125 H200" />
        <Bus d="M122 206 H160 V125" />

        <HNode
          x={200}
          y={88}
          w={152}
          h={74}
          title="SITE CONTROLLER"
          sub="STATE MACHINES · S&F"
          titleSize={11}
        />

        <Bus d="M352 125 H470" />
        <text x={411} y={112} textAnchor="middle" fontSize="9" letterSpacing="1.5" fill={mutedText}>
          MQTT / TLS
        </text>

        {/* AWS group */}
        <rect x={470} y={30} width={190} height={190} rx="4" fill="none" stroke={stroke} strokeDasharray="4 4" />
        <text x={482} y={48} fontSize="9" letterSpacing="2" fill={amber} fontWeight="500">
          AWS
        </text>
        <HNode x={486} y={58} w={158} h={32} title="IOT CORE" titleSize={10} />
        <Bus d="M565 90 V110" />
        <HNode x={486} y={110} w={158} h={32} title="KINESIS" titleSize={10} />
        <Bus d="M565 142 V162" />
        <HNode x={486} y={162} w={158} h={32} title="DYNAMODB" titleSize={10} />

        <Bus d="M660 125 H700" />
        <HNode x={700} y={95} w={92} h={60} title="OPS" sub="ALARMS · DASH" titleSize={11} />
        <circle cx={708} cy={103} r="2.5" fill={amber} className="pulse-dot" />
      </svg>

      {/* Vertical — < sm */}
      <svg
        viewBox="0 0 340 474"
        className="w-full sm:hidden"
        role="img"
        aria-hidden="true"
        style={{ fontFamily: "var(--font-plex-mono), monospace" }}
      >
        <HNode x={14} y={16} w={96} h={40} title="DISP 01" sub="EMV" titleSize={10} />
        <HNode x={122} y={16} w={96} h={40} title="DISP 02" sub="EMV" titleSize={10} />
        <HNode x={230} y={16} w={96} h={40} title="DISP 03" sub="EMV" titleSize={10} />

        <Bus d="M62 56 V86 H170 V110" />
        <Bus d="M170 56 V110" />
        <Bus d="M278 56 V86 H170" />

        <HNode
          x={70}
          y={110}
          w={200}
          h={58}
          title="SITE CONTROLLER"
          sub="STATE MACHINES · S&F"
          titleSize={11}
        />

        <Bus d="M170 168 V214" />
        <text x={182} y={196} fontSize="9" letterSpacing="1.5" fill={mutedText}>
          MQTT / TLS
        </text>

        <rect x={40} y={214} width={260} height={166} rx="4" fill="none" stroke={stroke} strokeDasharray="4 4" />
        <text x={52} y={232} fontSize="9" letterSpacing="2" fill={amber} fontWeight="500">
          AWS
        </text>
        <HNode x={60} y={240} w={220} h={30} title="IOT CORE" titleSize={10} />
        <Bus d="M170 270 V288" />
        <HNode x={60} y={288} w={220} h={30} title="KINESIS" titleSize={10} />
        <Bus d="M170 318 V336" />
        <HNode x={60} y={336} w={220} h={30} title="DYNAMODB" titleSize={10} />

        <Bus d="M170 380 V420" />
        <HNode x={70} y={420} w={200} h={44} title="OPS" sub="ALARMS · DASH" titleSize={11} />
        <circle cx={80} cy={428} r="2.5" fill={amber} className="pulse-dot" />
      </svg>

      <figcaption className="readout mt-3 text-muted">
        Fig. 01 — Edge-to-cloud path of a fuel transaction
      </figcaption>
    </figure>
  );
}
