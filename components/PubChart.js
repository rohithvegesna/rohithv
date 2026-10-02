"use client";

import { useState } from "react";

/*
  Publications per year — one series, thin columns with rounded data-ends,
  a hairline grid. Interactive mode makes every year a toggle (click, Enter,
  Space) and writes the hovered or focused year to a readout line, which is
  this site's tooltip. Compact mode is a static thumbnail for the home page.
  The list beneath the chart is its table view, so nothing is gated here.
*/
const MAX_BAR = 22;
const PAD_R = 10;
const PAD_T = 24;
const AXIS_H = 24;

/* Column with a rounded cap and a square foot on the baseline. */
function column(x, top, bottom, w, r) {
  const rr = Math.min(r, (bottom - top) / 2, w / 2);
  return `M${x} ${bottom} V${top + rr} Q${x} ${top} ${x + rr} ${top} H${x + w - rr} Q${x + w} ${top} ${x + w} ${top + rr} V${bottom} Z`;
}

const plural = (n) => `${n} publication${n === 1 ? "" : "s"}`;

export default function PubChart({
  data,
  selected = null,
  onSelect,
  compact = false,
}) {
  const [hover, setHover] = useState(null);
  const interactive = typeof onSelect === "function";
  const band = compact ? 40 : 68;
  const padL = compact ? 8 : 30;
  const plotH = compact ? 64 : 116;
  const max = Math.max(1, ...data.map((d) => d.count));
  const niceMax = max <= 4 ? 4 : Math.ceil(max / 4) * 4;
  const W = padL + data.length * band + PAD_R;
  const H = PAD_T + plotH + AXIS_H;
  const y = (v) => PAD_T + plotH - (v / niceMax) * plotH;
  const bar = Math.min(MAX_BAR, band * 0.42);
  const peak = data.reduce((a, d) => (d.count > a.count ? d : a), data[0]);
  const summary = data.map((d) => `${d.year}: ${d.count}`).join(", ");
  const focus =
    hover ?? (selected != null ? data.find((d) => d.year === selected) : null);

  return (
    <figure className="pc">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full"
        role={interactive ? "group" : "img"}
        aria-label={`Publications per year — ${summary}`}
      >
        {[0, niceMax / 2, niceMax].map((tv) => (
          <g key={tv}>
            <line
              className="pc-grid"
              x1={padL}
              x2={W - PAD_R}
              y1={y(tv)}
              y2={y(tv)}
            />
            {!compact ? (
              <text
                className="pc-axis"
                x={padL - 8}
                y={y(tv) + 3}
                fontSize="9"
                textAnchor="end"
              >
                {tv}
              </text>
            ) : null}
          </g>
        ))}
        {data.map((d, i) => {
          const bx = padL + i * band;
          const x = bx + (band - bar) / 2;
          const dim = selected != null && selected !== d.year;
          const isPeak = d === peak && d.count > 0;
          const props = interactive
            ? {
                role: "button",
                tabIndex: 0,
                "aria-pressed": selected === d.year,
                "aria-label": `${d.year}: ${plural(d.count)}${d.ieee ? `, ${d.ieee} IEEE` : ""}`,
                onClick: () => onSelect(d.year),
                onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(d.year);
                  }
                },
                onMouseEnter: () => setHover(d),
                onMouseLeave: () => setHover(null),
                onFocus: () => setHover(d),
                onBlur: () => setHover(null),
              }
            : {};
          return (
            <g key={d.year} className={`pc-hit${dim ? " pc-dim" : ""}`} {...props}>
              <rect
                className="pc-ring"
                x={bx + 2}
                y={PAD_T - 6}
                width={band - 4}
                height={plotH + 10}
                rx="3"
              />
              {d.count > 0 ? (
                <path
                  className="pc-col"
                  d={column(x, y(d.count), y(0), bar, 4)}
                  style={{ animationDelay: `${i * 55}ms` }}
                />
              ) : null}
              {isPeak && !compact ? (
                <text
                  className="pc-cap"
                  x={bx + band / 2}
                  y={y(d.count) - 7}
                  fontSize="10"
                  textAnchor="middle"
                >
                  {d.count}
                </text>
              ) : null}
              <text
                className="pc-axis"
                x={bx + band / 2}
                y={H - 7}
                fontSize={compact ? 9 : 10}
                textAnchor="middle"
              >
                {compact ? `’${String(d.year).slice(2)}` : d.year}
              </text>
            </g>
          );
        })}
      </svg>
      {interactive ? (
        <figcaption>
          <p className="dg-readout" role="status" aria-live="polite">
            {focus
              ? `${focus.year} · ${plural(focus.count)}${focus.ieee ? ` · ${focus.ieee} IEEE` : ""}`
              : selected != null
                ? "Click the year again to clear."
                : "Hover or Tab a year · click to filter the list."}
          </p>
        </figcaption>
      ) : null}
    </figure>
  );
}
