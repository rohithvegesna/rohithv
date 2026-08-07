import Link from "next/link";
import { caseStudies } from "@/data/work";

export const metadata = {
  title: "Work",
  description:
    "Case studies: forecourt payment & IoT infrastructure, PXE fleet imaging, SevenlyTravel, and fleet observability at national retail scale.",
  alternates: { canonical: "/work/" },
  openGraph: {
    type: "website",
    title: "Work — Rohith Varma Vegesna",
    description:
      "Case studies in payment and IoT infrastructure at national retail scale.",
    url: "/work/",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
};

export default function WorkIndex() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
      <h1 className="display text-3xl font-bold sm:text-4xl">Selected work</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted">
        Four systems, each written up the way engineering work actually goes:
        problem, constraints, architecture, outcome.
      </p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {caseStudies.map((cs) => (
          <Link
            key={cs.slug}
            href={`/work/${cs.slug}/`}
            className="group flex flex-col rounded-sm border border-line bg-surface p-6 transition-colors hover:border-accent"
          >
            <p className="readout text-muted">{cs.eyebrow}</p>
            <h2 className="display mt-3 text-xl font-semibold">{cs.title}</h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
              {cs.summary}
            </p>
            <p className="readout mt-5 text-accent">
              Read case study{" "}
              <span
                aria-hidden="true"
                className="inline-block transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
