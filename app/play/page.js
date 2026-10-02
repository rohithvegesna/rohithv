import Link from "next/link";
import FleetGameLoader from "@/components/game/FleetGameLoader";
import { site } from "@/data/site";

export const metadata = {
  title: "Light the fleet — a small game",
  description:
    "A small puzzle: every site has to reach the cloud, and the traces got scrambled. Turn the tiles until the whole fleet is online.",
  alternates: { canonical: "/play/" },
  openGraph: {
    type: "website",
    title: "Light the fleet — Rohith Varma Vegesna",
    description:
      "Every site has to reach the cloud. Turn the tiles until the whole fleet is online.",
    url: "/play/",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      name: "Light the fleet — a small game",
      url: `${site.url}/play/`,
      about: { "@type": "Person", name: site.name, url: site.url },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/` },
        { "@type": "ListItem", position: 2, name: "Play" },
      ],
    },
  ],
};

export default function Play() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 sm:px-10 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <p className="tag text-amber">Interlude · a small game</p>
      <h1 className="display mt-4 text-5xl text-fg sm:text-7xl">
        Light the fleet
      </h1>
      <p className="mt-6 max-w-2xl leading-relaxed text-muted">
        Every site has to reach the cloud, and someone scrambled the traces.
        Turn tiles until the whole fleet is online. A trace that points
        nowhere is a fault, so every line has to terminate.
      </p>

      <div className="mt-12">
        <FleetGameLoader />
      </div>

      <p className="tag mt-14 text-muted">
        Fig. 1 — silence is the dangerous failure.{" "}
        <Link href="/work/fleet-observability/" className="text-amber">
          The real version →
        </Link>
      </p>
    </main>
  );
}
