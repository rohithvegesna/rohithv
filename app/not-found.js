import Link from "next/link";

export const metadata = {
  title: "404 — Signal lost",
};

/* OUT OF SERVICE — the bagged nozzle. Approved copy verbatim below. */
export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col items-center px-5 py-16 text-center sm:py-24">
      <svg
        viewBox="0 0 220 200"
        className="w-48 sm:w-56"
        role="img"
        aria-label="A fuel pump nozzle wrapped in an out-of-service bag"
      >
        <rect x="60" y="30" width="100" height="140" rx="10" fill="var(--porcelain)" stroke="var(--ink)" strokeWidth="4" />
        <rect x="74" y="46" width="72" height="34" rx="4" fill="var(--cream)" stroke="var(--ink)" strokeWidth="3" />
        <rect x="74" y="92" width="72" height="10" rx="3" fill="var(--green)" />
        <path
          d="M160 96 C176 96 184 106 184 118 L184 140 C184 152 176 158 166 158 L150 158 C144 158 140 152 142 144 L150 116 C152 106 152 96 160 96 Z"
          fill="var(--paper)"
          stroke="var(--ink)"
          strokeWidth="3.5"
        />
        <path d="M148 122 L178 122 M146 132 L180 132 M144 142 L180 142" stroke="var(--ink)" strokeWidth="1.6" opacity="0.4" />
        <path d="M158 96 L166 88 L174 96" fill="none" stroke="var(--ink)" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M140 150 C150 160 176 160 186 148" fill="none" stroke="var(--red)" strokeWidth="5" strokeLinecap="round" />
      </svg>

      <p className="strip-sign sign-label mt-8 !bg-red !text-paper">
        ERR 404 · DEVICE SILENT · LAST HEARTBEAT UNKNOWN
      </p>
      <h1 className="display mt-6 max-w-2xl text-4xl uppercase text-ink sm:text-6xl">
        This page stopped reporting.
      </h1>
      <p className="mt-5 max-w-xl leading-relaxed text-steel">
        The address you followed doesn&apos;t exist here — moved, retired, or
        never provisioned. In a fleet, silence like this raises an alarm; on
        this site it just gets you a link home.
      </p>
      <Link href="/" className="pill mt-9">
        Return to base
      </Link>
    </main>
  );
}
