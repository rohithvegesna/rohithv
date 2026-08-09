"use client";

/*
  The Trace — diagram component library. Every diagram on the site renders
  from these parts; their consistency is the point. Inline SVG + CSS only.

  Conventions
  - Traces are drawn with .dg-bus (cold) and .dg-hot (lit) strokes.
  - Packets ride CSS offset-path with negative delays so reduced-motion can
    freeze them mid-flight (animation-play-state: paused).
  - Nodes are keyboard-focusable; focusing/hovering one writes its one-line
    detail to the figure's readout (aria-live). Nothing is gated behind it.
  - The <Diagram> wrapper pauses all animation offscreen and on tab blur.
*/

import { createContext, useContext, useEffect, useRef, useState } from "react";

export function Diagram({
  viewBox,
  label,
  caption,
  height = "auto",
  className = "",
  children,
  readoutDefault = "",
}) {
  const ref = useRef(null);
  const [readout, setReadout] = useState(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => el.classList.toggle("dg-paused", !e.isIntersecting),
      { threshold: 0.05 }
    );
    io.observe(el);
    const onVis = () =>
      el.classList.toggle("dg-paused", document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <figure ref={ref} className={`dg ${className}`}>
      <svg
        viewBox={viewBox}
        role="group"
        aria-label={label}
        style={{ height, width: "100%" }}
        className="dg-svg"
      >
        <DiagramCtx.Provider value={setReadout}>{children}</DiagramCtx.Provider>
      </svg>
      {readoutDefault !== null ? (
        <p className="dg-readout" role="status" aria-live="polite">
          {readout ?? readoutDefault}
        </p>
      ) : null}
      {caption ? <figcaption className="dg-caption">{caption}</figcaption> : null}
    </figure>
  );
}

const DiagramCtx = createContext(() => {});

export function Node({
  x,
  y,
  w,
  h,
  title,
  sub,
  detail,
  kind = "edge", // edge | cloud | terminal
  titleSize = 11,
}) {
  const setReadout = useContext(DiagramCtx);
  const cx = x + w / 2;
  const cy = y + h / 2;
  const interactive = Boolean(detail);
  return (
    <g
      className={`dg-node dg-node-${kind}`}
      {...(interactive
        ? {
            tabIndex: 0,
            role: "button",
            "aria-label": `${title} — details`,
            onFocus: () => setReadout(detail),
            onBlur: () => setReadout(null),
            onMouseEnter: () => setReadout(detail),
            onMouseLeave: () => setReadout(null),
          }
        : {})}
    >
      <rect x={x} y={y} width={w} height={h} rx={kind === "terminal" ? h / 2 : 3} />
      {/* corner ticks, the library's node signature */}
      <path
        className="dg-corner"
        d={`M${x} ${y + 7} V${y} H${x + 7} M${x + w - 7} ${y} H${x + w} V${y + 7}
            M${x + w} ${y + h - 7} V${y + h} H${x + w - 7} M${x + 7} ${y + h} H${x} V${y + h - 7}`}
      />
      <text className="dg-title" x={cx} y={sub ? cy - 2.5 : cy + 3.5} fontSize={titleSize} textAnchor="middle">
        {title}
      </text>
      {sub ? (
        <text className="dg-sub" x={cx} y={cy + 12.5} fontSize="8" textAnchor="middle">
          {sub}
        </text>
      ) : null}
    </g>
  );
}

export function Bus({ d, hot = true }) {
  return (
    <g aria-hidden="true">
      <path className="dg-bus" d={d} />
      {hot ? <path className="dg-hot" d={d} /> : null}
    </g>
  );
}

export function Packet({ path, dur = 6, delay = 0, hue = "amber", r = 3 }) {
  return (
    <circle
      aria-hidden="true"
      className={`dg-packet dg-packet-${hue}`}
      r={r}
      style={{
        offsetPath: `path("${path}")`,
        animationDuration: `${dur}s`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

/* A dashed region (cloud boundary, keepout) with a small tag. */
export function Region({ x, y, w, h, tag }) {
  return (
    <g aria-hidden="true" className="dg-region">
      <rect x={x} y={y} width={w} height={h} rx="6" />
      {tag ? (
        <>
          <rect className="dg-region-tagbg" x={x + 8} y={y - 7} width={tag.length * 6.4 + 10} height="14" rx="2" />
          <text className="dg-region-tag" x={x + 13} y={y + 3.5} fontSize="9">
            {tag}
          </text>
        </>
      ) : null}
    </g>
  );
}

/* Measurement ticks along a horizontal span. */
export function Ticks({ x1, x2, y, n = 8 }) {
  const step = (x2 - x1) / (n - 1);
  let d = "";
  for (let i = 0; i < n; i++) d += `M${x1 + i * step} ${y - 3} V${y + 3} `;
  return <path aria-hidden="true" className="dg-ticks" d={d} />;
}

/* Small status glyph: a pulsing state dot with a mono label. */
export function StateGlyph({ x, y, label, hue = "green", period = 7, delay = 0 }) {
  return (
    <g aria-hidden="true" className={`dg-state dg-state-${hue}`}
       style={{ animationDuration: `${period}s`, animationDelay: `${delay}s` }}>
      <circle cx={x} cy={y} r="3" />
      <text x={x + 8} y={y + 3} fontSize="8.5">{label}</text>
    </g>
  );
}
