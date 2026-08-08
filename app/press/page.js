import { press } from "@/data/press";
import { site } from "@/data/site";

export const metadata = {
  title: "Press",
  description:
    "Press coverage of Rohith Varma Vegesna's work on smart fueling systems, fuel-station cybersecurity, and IoT-driven automation.",
  alternates: { canonical: "/press/" },
  openGraph: {
    type: "website",
    title: "Press — Rohith Varma Vegesna",
    description:
      "Coverage of smart fueling systems, fuel-station cybersecurity, and IoT-driven automation.",
    url: "/press/",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
};

export default function Press() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Press — Rohith Varma Vegesna",
    url: `${site.url}/press/`,
    about: { "@type": "Person", name: site.name, url: site.url },
  };

  return (
    <main className="mx-auto max-w-4xl px-5 py-12 sm:px-10 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="display text-5xl text-silk sm:text-7xl">Press</h1>
      <p className="mt-6 max-w-2xl leading-relaxed text-silk-muted">
        Coverage of my work on smart fueling systems, fuel-station
        cybersecurity, and IoT-driven automation.
      </p>
      <ul className="mt-12 space-y-0">
        {press.map((item) => (
          <li
            key={item.link}
            className="border-t border-silk/12 py-8 last:border-b"
          >
            <p className="silk-label text-copper">{item.date}</p>
            <h2 className="mt-3 text-xl font-bold leading-snug">
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="trace-link"
              >
                {item.title}
              </a>
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-silk-muted">
              {item.description}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
