import Link from "next/link";
import { caseStudies } from "@/data/work";

/* Case studies as branches routed off the spine. */
export default function WorkGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {caseStudies.map((cs) => (
        <Link
          key={cs.slug}
          href={`/work/${cs.slug}/`}
          className="branch group flex flex-col p-6 sm:p-7"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="tag text-muted">{cs.eyebrow}</p>
            <span className="dg-dot mt-1 shrink-0" aria-hidden="true" />
          </div>
          <h3 className="mt-4 text-xl font-semibold leading-snug text-fg">
            {cs.title}
          </h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
            {cs.summary}
          </p>
          <p className="tag mt-6 flex items-center gap-2 text-amber">
            Read case study
            <span
              aria-hidden="true"
              className="mono transition-transform duration-150 group-hover:translate-x-1"
            >
              →
            </span>
          </p>
        </Link>
      ))}
    </div>
  );
}
