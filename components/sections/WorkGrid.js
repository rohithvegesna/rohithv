import Link from "next/link";
import { caseStudies } from "@/data/work";

function Nozzle() {
  return (
    <svg viewBox="0 0 32 32" className="nozzle h-8 w-8 shrink-0" aria-hidden="true">
      <path
        d="M7 14 L7 27 L12 27 L12 18 L17 18 L17 27 L22 27 L22 14 C22 11 20 9 17 9 L12 9 C9 9 7 11 7 14 Z"
        fill="var(--green)"
        stroke="var(--ink)"
        strokeWidth="1.6"
      />
      <path
        d="M21 11 L26 8 L28 10 L23 14"
        fill="var(--green)"
        stroke="var(--ink)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <rect x="9.5" y="11" width="10" height="4.5" rx="1" fill="var(--porcelain)" stroke="var(--ink)" strokeWidth="1.2" />
    </svg>
  );
}

/* Case studies as numbered pump bays. */
export default function WorkGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {caseStudies.map((cs, i) => (
        <Link
          key={cs.slug}
          href={`/work/${cs.slug}/`}
          className="bay group flex flex-col"
        >
          <div className="flex items-center justify-between gap-3 border-b-2 border-ink bg-green px-5 py-2.5 text-porcelain">
            <span className="sign-label !tracking-[0.3em]">
              Pump 0{i + 1}
            </span>
            <Nozzle />
          </div>
          <div className="flex flex-1 flex-col p-6">
            <p className="sign-label text-steel">{cs.eyebrow}</p>
            <h3 className="mt-3 text-xl font-bold leading-snug text-ink">
              {cs.title}
            </h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
              {cs.summary}
            </p>
            <p className="sign-label mt-6 flex items-center gap-2 text-green">
              Read case study
              <span
                aria-hidden="true"
                className="transition-transform duration-150 group-hover:translate-x-1"
              >
                →
              </span>
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
