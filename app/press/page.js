import { press } from "@/data/press";
import { site } from "@/data/site";

export const metadata = {
  title: "Press",
  description:
    "Press coverage of Rohith Varma Vegesna's work on smart fueling systems, fuel-station cybersecurity, and IoT-driven automation.",
  alternates: { canonical: "/press/" },
  openGraph: {
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
    <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="display text-3xl font-bold sm:text-4xl">Press</h1>
      <p className="mt-4 leading-relaxed text-muted">
        Coverage of my work on smart fueling systems, fuel-station
        cybersecurity, and IoT-driven automation.
      </p>
      <ul className="mt-12 space-y-10">
        {press.map((item) => (
          <li key={item.link}>
            <p className="readout text-amber">{item.date}</p>
            <h2 className="display mt-2 text-xl font-semibold leading-snug">
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-line underline-offset-4 transition-colors hover:decoration-accent"
              >
                {item.title}
              </a>
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              {item.description}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
