import { publications, ORCID_ID } from "@/data/publications";
import { site } from "@/data/site";

export const metadata = {
  title: "Publications",
  description:
    "24 peer-reviewed publications on federated learning, secure LLM deployment, and cloud-native fuel-system architecture, including IEEE papers.",
  alternates: { canonical: "/publications/" },
  openGraph: {
    title: "Publications — Rohith Varma Vegesna",
    description:
      "Peer-reviewed research on federated learning, LLM deployment, and cloud-native fuel systems.",
    url: "/publications/",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
};

const isIEEE = (pub) => pub.doi?.startsWith("10.1109");

export default function Publications() {
  const years = [...new Set(publications.map((p) => p.year))].sort(
    (a, b) => b - a
  );
  const ieeeCount = publications.filter(isIEEE).length;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Publications — Rohith Varma Vegesna",
    url: `${site.url}/publications/`,
    about: { "@type": "Person", name: site.name, url: site.url },
  };

  return (
    <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="display text-3xl font-bold sm:text-4xl">Publications</h1>
      <p className="mt-4 leading-relaxed text-muted">
        {publications.length} peer-reviewed works — {ieeeCount} IEEE conference
        papers among them — on federated learning, secure LLM deployment, and
        the cloud-native architecture behind fuel systems. Sourced from{" "}
        <a
          href={site.orcid}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-line underline-offset-4 transition-colors hover:decoration-accent"
        >
          ORCID {ORCID_ID}
        </a>
        .
      </p>

      {years.map((year) => (
        <section key={year} className="mt-12">
          <h2 className="readout mb-6 flex items-center gap-3 text-amber">
            <span className="inline-block h-px w-8 bg-line" aria-hidden="true" />
            {year}
          </h2>
          <ul className="space-y-6">
            {publications
              .filter((p) => p.year === year)
              .map((pub) => (
                <li key={pub.doi ?? pub.title}>
                  <div className="flex items-start gap-3">
                    {isIEEE(pub) && (
                      <span className="readout mt-1 shrink-0 rounded-sm border border-line px-1.5 py-0.5 text-amber">
                        IEEE
                      </span>
                    )}
                    <div>
                      <a
                        href={pub.doi ? `https://doi.org/${pub.doi}` : site.orcid}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium leading-snug underline decoration-line underline-offset-4 transition-colors hover:decoration-accent"
                      >
                        {pub.title}
                      </a>
                      {pub.venue ? (
                        <p className="mt-1 text-sm text-muted">{pub.venue}</p>
                      ) : null}
                      {pub.doi ? (
                        <p className="readout mt-1 text-muted">
                          doi:{pub.doi.toLowerCase()}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
