import Link from "next/link";

export const metadata = {
  title: "404 — Signal lost",
};

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-start px-5 py-24 sm:px-8">
      <p className="readout text-amber">
        ERR 404 · DEVICE SILENT · LAST HEARTBEAT UNKNOWN
      </p>
      <h1 className="display mt-4 text-4xl font-bold sm:text-5xl">
        This page stopped reporting.
      </h1>
      <p className="mt-5 max-w-xl leading-relaxed text-muted">
        The address you followed doesn&apos;t exist here — moved, retired, or
        never provisioned. In a fleet, silence like this raises an alarm; on
        this site it just gets you a link home.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
      >
        Return to base
      </Link>
    </main>
  );
}
