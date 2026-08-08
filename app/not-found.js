import Link from "next/link";

export const metadata = {
  title: "404 — Signal lost",
};

/* The unrouted net: a component with only ratsnest airwires reaching it. */
export default function NotFound() {
  return (
    <main className="relative mx-auto flex max-w-4xl flex-col items-start overflow-hidden px-5 py-24 sm:px-10">
      <svg
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
        preserveAspectRatio="none"
        viewBox="0 0 800 600"
      >
        <path className="airwire" d="M-20 80 L340 300" />
        <path className="airwire" d="M820 40 L360 310" />
        <path className="airwire" d="M-40 560 L330 330" />
        <path className="airwire" d="M840 620 L370 340" />
        <path className="airwire" d="M400 -30 L350 290" />
        <circle
          cx="352"
          cy="315"
          r="7"
          fill="none"
          stroke="var(--drc-red)"
          strokeWidth="2"
        />
      </svg>
      <div className="relative">
        <p className="silk-label flex items-center gap-3 text-drc">
          <span
            aria-hidden="true"
            className="led"
            style={{ background: "var(--drc-red)", boxShadow: "0 0 6px var(--drc-red)" }}
          />
          ERR 404 · DEVICE SILENT · LAST HEARTBEAT UNKNOWN
        </p>
        <h1 className="display mt-6 max-w-3xl text-5xl text-silk sm:text-7xl">
          This page stopped reporting.
        </h1>
        <p className="mt-6 max-w-xl leading-relaxed text-silk-muted">
          The address you followed doesn&apos;t exist here — moved, retired, or
          never provisioned. In a fleet, silence like this raises an alarm; on
          this site it just gets you a link home.
        </p>
        <Link href="/" className="pad mt-9">
          Return to base
        </Link>
      </div>
    </main>
  );
}
