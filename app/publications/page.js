import { publications, SCHOLAR_URL } from "@/data/publications";
import { site } from "@/data/site";

export const metadata = {
  title: "Publications",
  description:
    "27 peer-reviewed publications on federated learning, secure LLM deployment, and cloud-native fuel-system architecture, including IEEE papers.",
  alternates: { canonical: "/publications/" },
  openGraph: {
    type: "website",
    title: "Publications — Rohith Varma Vegesna",
    description:
      "Peer-reviewed research on federated learning, LLM deployment, and cloud-native fuel systems.",
    url: "/publications/",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
};

const isIEEE = (pub) => pub.doi?.startsWith("10.1109");
const soloAuthor = (pub) => pub.authors === "RV Vegesna";

/* The publications list, set as the board's bill of materials. */
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

  const itemNo = new Map(publications.map((p, i) => [p.title, i + 1]));

  return (
    <main className="mx-auto max-w-4xl px-5 py-12 sm:px-10 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex items-end justify-between gap-4">
        <h1 className="display text-5xl text-silk sm:text-7xl">Publications</h1>
        <span className="designator" aria-hidden="true">
          BOM
        </span>
      </div>
      <p className="mt-6 max-w-2xl leading-relaxed text-silk-muted">
        {publications.length} peer-reviewed works — {ieeeCount} IEEE conference
        papers among them — on federated learning, secure LLM deployment, and
        the cloud-native architecture behind fuel systems. Full record on{" "}
        <a
          href={SCHOLAR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="trace-link"
        >
          Google Scholar
        </a>
        .
      </p>

      {years.map((year) => (
        <section key={year} className="mt-12">
          <h2 className="silk-label mb-6 flex items-center gap-3 text-gold">
            <span aria-hidden="true" className="inline-block h-0.5 w-8 bg-copper" />
            {year}
          </h2>
          <ul className="space-y-0">
            {publications
              .filter((p) => p.year === year)
              .map((pub) => {
                const item = itemNo.get(pub.title);
                return (
                  <li
                    key={pub.title}
                    className="grid grid-cols-[2.6rem_1fr] gap-x-4 border-t border-silk/12 py-5 last:border-b sm:grid-cols-[3.2rem_1fr_auto]"
                  >
                    <span
                      className="silk-label pt-1 text-silk-faint"
                      aria-hidden="true"
                    >
                      {String(item).padStart(3, "0")}
                    </span>
                    <div>
                      <a
                        href={pub.doi ? `https://doi.org/${pub.doi}` : SCHOLAR_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="trace-link font-bold leading-snug"
                      >
                        {pub.title}
                      </a>
                      {!soloAuthor(pub) && (
                        <p className="mt-1.5 text-sm text-silk-muted">
                          {pub.authors}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-silk-muted">{pub.venue}</p>
                      <p className="silk-label mt-2 text-silk-muted">
                        {pub.doi
                          ? `doi:${pub.doi.toLowerCase()}`
                          : "via google scholar"}
                        {pub.citedBy > 0 ? ` · cited by ${pub.citedBy}` : ""}
                      </p>
                    </div>
                    {isIEEE(pub) ? (
                      <span className="silk-label col-start-2 mt-2 h-fit w-fit border border-gold/50 px-1.5 py-0.5 text-gold sm:col-start-3 sm:mt-1">
                        IEEE
                      </span>
                    ) : null}
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </main>
  );
}
