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
    <main className="mx-auto max-w-6xl px-5 py-12 sm:px-10 sm:py-16">
      <h1 className="display text-5xl text-silk sm:text-7xl">Selected work</h1>
      <p className="mt-6 max-w-2xl leading-relaxed text-silk-muted">
        Four systems, each written up the way engineering work actually goes:
        problem, constraints, architecture, outcome.
      </p>
      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {caseStudies.map((cs, i) => (
          <Link
            key={cs.slug}
            href={`/work/${cs.slug}/`}
            className="module group relative flex flex-col p-6 pl-7"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="silk-label text-silk-muted">{cs.eyebrow}</p>
              <span className="led mt-0.5 shrink-0" aria-hidden="true" />
            </div>
            <h2 className="display mt-4 text-2xl text-silk">{cs.title}</h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-silk-muted">
              {cs.summary}
            </p>
            <p className="silk-label mt-6 flex items-center justify-between text-gold">
              Read case study
              <span
                aria-hidden="true"
                className="font-mono transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </p>
            <span
              aria-hidden="true"
              className="silk-label absolute bottom-2 right-3 text-silk-faint"
            >
              U10{i + 1}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
