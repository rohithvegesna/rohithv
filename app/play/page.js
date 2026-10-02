import Link from "next/link";
import PumpGameLoader from "@/components/game/PumpGameLoader";
import FleetGameLoader from "@/components/game/FleetGameLoader";
import { site } from "@/data/site";

export const metadata = {
  title: "Play",
  description:
    "Two small games from the forecourt: fill the tank to the cent, and turn the traces until every site reaches the cloud.",
  alternates: { canonical: "/play/" },
  openGraph: {
    type: "website",
    title: "Play — Rohith Varma Vegesna",
    description:
      "Two small games from the forecourt: fill to the cent, and light the fleet.",
    url: "/play/",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      name: "Play — two small games",
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

function Game({ id, index, heading, blurb, children }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="mt-14 sm:mt-20">
      <h2 id={`${id}-h`} className="dock-h">
        <span className="tag" aria-hidden="true">
          {index}
        </span>
        {heading}
      </h2>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted">{blurb}</p>
      <div className="mt-8">{children}</div>
    </section>
  );
}

export default function Play() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 sm:px-10 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <p className="tag text-amber">Interlude · two small games</p>
      <h1 className="display mt-4 text-5xl text-fg sm:text-7xl">Play</h1>
      <p className="mt-6 max-w-2xl leading-relaxed text-muted">
        The forecourt in miniature. One game is the pump; the other is the
        fleet behind it.
      </p>

      <Game
        id="pump"
        index="01"
        heading="Fill to the cent"
        blurb="The $20 game, the way everyone plays it at the pump: hold the trigger, let go on the cent. Five fills, faster each time, and from the third a worn nozzle that keeps counting after you release. Overshoot by five dollars and the pre-authorization cuts you off."
      >
        <PumpGameLoader />
      </Game>

      <Game
        id="fleet"
        index="02"
        heading="Light the fleet"
        blurb="Every site has to reach the cloud, and someone scrambled the traces. Turn tiles until the whole fleet is online. A trace that points nowhere is a fault, so every line has to terminate."
      >
        <FleetGameLoader />
      </Game>

      <p className="tag mt-14 text-muted">
        Fig. 1 — silence is the dangerous failure.{" "}
        <Link href="/work/fleet-observability/" className="text-amber">
          The real version →
        </Link>
      </p>
    </main>
  );
}
