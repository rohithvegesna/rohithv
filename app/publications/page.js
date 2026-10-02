import PublicationsExplorer from "@/components/PublicationsExplorer";
import { publications, SCHOLAR_URL, isIEEE } from "@/data/publications";
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

/* The publications list, set as the board's bill of materials. */
export default function Publications() {
  const ieeeCount = publications.filter(isIEEE).length;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Publications — Rohith Varma Vegesna",
        url: `${site.url}/publications/`,
        about: { "@type": "Person", name: site.name, url: site.url },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: publications.length,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${site.url}/`,
          },
          { "@type": "ListItem", position: 2, name: "Publications" },
        ],
      },
    ],
  };

  return (
    <main className="mx-auto max-w-4xl px-5 py-12 sm:px-10 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="display text-5xl text-fg sm:text-7xl">Publications</h1>
      <p className="mt-6 max-w-2xl leading-relaxed text-muted">
        {publications.length} peer-reviewed works — {ieeeCount} IEEE conference
        papers among them — on federated learning, secure LLM deployment, and
        the cloud-native architecture behind fuel systems. Full record on{" "}
        <a
          href={SCHOLAR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="u-link"
        >
          Google Scholar
        </a>
        .
      </p>

      <div className="mt-10">
        <PublicationsExplorer />
      </div>
    </main>
  );
}
