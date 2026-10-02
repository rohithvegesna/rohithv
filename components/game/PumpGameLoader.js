"use client";

import dynamic from "next/dynamic";

/* Client-only: the best score is read from the visitor's browser on first
   render, which static HTML cannot know. */
const PumpGame = dynamic(() => import("./PumpGame"), {
  ssr: false,
  loading: () => (
    <div className="pump" aria-hidden="true">
      <p className="tag border-b border-line/70 pb-3 text-muted">Dispenser 04 · powering up…</p>
      <div className="pump-big mt-5 text-muted">$ 0.00</div>
    </div>
  ),
});

export default function PumpGameLoader() {
  return <PumpGame />;
}
