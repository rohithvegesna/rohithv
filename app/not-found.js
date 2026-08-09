import Link from "next/link";
import { NoRoute } from "@/components/diagram/diagrams";

export const metadata = {
  title: "404 — Signal lost",
};

/* The route dead-ends: NO ROUTE TO HOST. Approved copy verbatim below. */
export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center px-5 py-16 text-center sm:py-24">
      <div className="w-full max-w-sm">
        <NoRoute />
      </div>
      <h1 className="display mt-8 max-w-2xl text-4xl text-fg sm:text-5xl">
        This page stopped reporting.
      </h1>
      <p className="tag mt-4 text-fault">
        ERR 404 · DEVICE SILENT · LAST HEARTBEAT UNKNOWN
      </p>
      <p className="mt-5 max-w-xl leading-relaxed text-muted">
        The address you followed doesn&apos;t exist here — moved, retired, or
        never provisioned. In a fleet, silence like this raises an alarm; on
        this site it just gets you a link home.
      </p>
      <Link href="/" className="btn mt-9">
        Return to base
      </Link>
    </main>
  );
}
