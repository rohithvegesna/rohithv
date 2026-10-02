"use client";

import dynamic from "next/dynamic";

/* Client-only: the daily board depends on the visitor's date, so it must
   never be baked into the static HTML at build time. */
const FleetGame = dynamic(() => import("./FleetGame"), {
  ssr: false,
  loading: () => (
    <div className="grid gap-8 md:grid-cols-[minmax(0,22rem)_1fr]">
      <div className="fl-board aspect-square" aria-hidden="true" />
      <p className="dg-readout">Powering up the fleet…</p>
    </div>
  ),
});

export default function FleetGameLoader() {
  return <FleetGame />;
}
