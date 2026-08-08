import Link from "next/link";
import { caseStudies } from "@/data/work";

export default function WorkGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {caseStudies.map((cs) => (
        <Link
          key={cs.slug}
          href={`/work/${cs.slug}/`}
          className="card group flex flex-col p-6 sm:p-7"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="silk-label text-silk-muted">{cs.eyebrow}</p>
            <span className="led mt-0.5 shrink-0" aria-hidden="true" />
          </div>
          <h3 className="mt-4 text-xl font-bold leading-snug text-silk">
            {cs.title}
          </h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-silk-muted">
            {cs.summary}
          </p>
          <p className="silk-label mt-6 flex items-center gap-2 text-gold">
            Read case study
            <span
              aria-hidden="true"
              className="font-mono transition-transform duration-150 group-hover:translate-x-1"
            >
              →
            </span>
          </p>
        </Link>
      ))}
    </div>
  );
}
