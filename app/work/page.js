import Link from "next/link";
import { caseStudies } from "@/data/work";
import { site } from "@/data/site";

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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      name: "Work — Rohith Varma Vegesna",
      url: `${site.url}/work/`,
      about: { "@type": "Person", name: site.name, url: site.url },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/` },
        { "@type": "ListItem", position: 2, name: "Work" },
      ],
    },
  ],
};

export default function WorkIndex() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-12 sm:px-10 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="display text-5xl text-fg sm:text-7xl">Selected work</h1>
      <p className="mt-6 max-w-2xl leading-relaxed text-muted">
        Four systems, each written up the way engineering work actually goes:
        problem, constraints, architecture, outcome.
      </p>
      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {caseStudies.map((cs) => (
          <Link
            key={cs.slug}
            href={`/work/${cs.slug}/`}
            className="card group flex flex-col p-6 sm:p-7"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="tag text-muted">{cs.eyebrow}</p>
              <span className="led mt-0.5 shrink-0" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-xl font-bold leading-snug text-fg">
              {cs.title}
            </h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
              {cs.summary}
            </p>
            <p className="tag mt-6 flex items-center gap-2 text-amber">
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
    </main>
  );
}
