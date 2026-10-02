/*
  Mini trace — a case study's stages as stations on one short bus, with a
  single packet riding the rail underneath. Pure SVG, no hooks, so server
  pages can render it. Decorative: the card's text carries the meaning.
*/
const W = 320;
const H = 46;
const NODE_Y = 4;
const NODE_H = 22;
const BUS_Y = 40;
const GAP = 12;
const PAD = 2;

export default function MiniTrace({ stages, seed = 0 }) {
  const n = stages.length;
  const w = (W - PAD * 2 - GAP * (n - 1)) / n;
  const bus = `M${PAD} ${BUS_Y} H${W - PAD}`;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mini-trace block w-full"
      aria-hidden="true"
      focusable="false"
    >
      <path className="mt-bus" d={bus} />
      <circle
        className="dg-packet dg-packet-amber"
        r="2.6"
        style={{
          offsetPath: `path("${bus}")`,
          animationDuration: `${5 + (seed % 3)}s`,
          animationDelay: `${-1.7 * seed - 0.4}s`,
        }}
      />
      {stages.map((label, i) => {
        const x = PAD + i * (w + GAP);
        const cx = x + w / 2;
        const terminal = i === 0 || i === n - 1;
        return (
          <g key={label} className="mt-node">
            <path className="mt-tap" d={`M${cx} ${NODE_Y + NODE_H} V${BUS_Y}`} />
            <rect
              x={x}
              y={NODE_Y}
              width={w}
              height={NODE_H}
              rx={terminal ? NODE_H / 2 : 2}
            />
            <text
              x={cx}
              y={NODE_Y + NODE_H / 2 + 2.6}
              fontSize="7.5"
              textAnchor="middle"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
