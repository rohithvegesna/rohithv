import Image from "next/image";
import Link from "next/link";
import Schematic from "@/components/Schematic";
import { site, experience, education, skills } from "@/data/site";
import { caseStudies } from "@/data/work";
import { publications } from "@/data/publications";

export const metadata = {
  title: "Rohith Varma Vegesna — Senior Software Engineer & Tech Lead",
  description:
    "Payment and IoT infrastructure for fuel retail at national scale: EMV at the dispenser, edge-to-cloud telemetry on AWS, and 27 peer-reviewed publications.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "Rohith Varma Vegesna — Senior Software Engineer & Tech Lead",
    description:
      "Payment and IoT infrastructure for fuel retail at national scale.",
    url: "/",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${site.url}/#person`,
      name: site.name,
      url: site.url,
      image: `${site.url}/profile.webp`,
      jobTitle: "Senior Software Engineer & Tech Lead",
      worksFor: { "@type": "Organization", name: site.company },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Dallas–Fort Worth",
        addressRegion: "TX",
        addressCountry: "US",
      },
      email: `mailto:${site.email}`,
      sameAs: [site.github, site.linkedin, site.scholar],
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.name,
      publisher: { "@id": `${site.url}/#person` },
    },
  ],
};

/* Section = component footprint on the board, branched off the bus rail. */
function Footprint({ id, refDes, heading, children }) {
  return (
    <section aria-labelledby={id} className="relative mt-14 sm:mt-20">
      {/* net stub from the rail into the footprint */}
      <span
        aria-hidden="true"
        className="absolute -left-5 top-9 h-0.5 w-5 bg-copper sm:-left-8 sm:w-8"
      />
      <div className="footprint px-5 py-8 sm:px-9 sm:py-10">
        <div className="flex items-start justify-between gap-4">
          <h2 id={id} className="silk-label flex items-center gap-3 text-gold">
            <span className="led led-on" aria-hidden="true" />
            {heading}
          </h2>
          <span className="designator -mt-2" aria-hidden="true">
            {refDes}
          </span>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

export default function Home() {
  const recentPubs = publications.slice(0, 3);
  return (
    <main className="mx-auto max-w-6xl px-5 pb-8 sm:px-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero — silkscreen poster + the probeable net */}
      <section className="pt-14 sm:pt-24">
        <p className="silk-label flex flex-wrap items-center gap-x-3 gap-y-1 text-copper">
          <span className="led led-on" aria-hidden="true" />
          {site.role} · {site.company} · {site.location}
        </p>
        <h1 className="display mt-7 max-w-5xl text-[clamp(2.6rem,8.5vw,7rem)] text-silk">
          I build the systems that let a fuel dispenser{" "}
          <span className="text-gold">take a payment.</span>
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-silk-muted">
          EMV at the pump, edge devices in the field, and the AWS backbone
          behind fuel-station automation for major U.S. retail brands — with{" "}
          {publications.length} peer-reviewed publications along the way.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <a href={`mailto:${site.email}`} className="pad">
            Email me
          </a>
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            className="pad-nc"
          >
            GitHub
          </a>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="pad-nc"
          >
            LinkedIn
          </a>
        </div>
      </section>

      {/* the bus rail begins under the hero and runs the page */}
      <div className="rail mt-16 pl-5 sm:mt-24 sm:pl-8">
        <div className="pt-2 sm:pt-4">
          <Schematic />
        </div>

        <Footprint id="about" refDes="U1" heading="About">
          <div className="flex flex-col gap-10 md:flex-row md:items-start">
            <div className="relative w-40 shrink-0 border border-silk/20 bg-substrate-3 sm:w-48">
              <Image
                src="/profile.webp"
                alt="Portrait of Rohith Varma Vegesna"
                width={192}
                height={192}
              />
              <span
                aria-hidden="true"
                className="absolute -bottom-1.5 -right-1.5 h-3 w-3 rounded-full border-[3px] border-copper bg-substrate-3"
              />
            </div>
            <div className="max-w-2xl space-y-4 leading-relaxed text-silk">
              <p>
                I lead engineering on 7-Eleven&apos;s DEX/FuelControl platform:
                secure, IoT-driven fuel-station automation covering EMV payment
                processing at the dispenser and edge-to-cloud connectivity
                across major fuel retail brands. My team owns the path a fuel
                transaction takes from pump hardware to AWS — and I own the
                delivery and architecture that keep it running.
              </p>
              <p>
                Away from the forecourt I research and publish —{" "}
                {publications.length} peer-reviewed works on federated
                learning, LLM and edge deployment, and cloud-native
                architecture — founded SevenlyTravel, a travel-booking
                platform, and build hardware: PXE-boot fleet imaging rigs,
                custom USB-HID devices, and an extensive home lab.
              </p>
            </div>
          </div>
        </Footprint>

        <Footprint id="experience" refDes="U2" heading="Experience">
          <ol className="space-y-14">
            {experience.map((company) => (
              <li key={company.org}>
                <h3 className="display text-2xl text-silk sm:text-3xl">
                  {company.org}
                </h3>
                <p className="silk-label mt-1.5 text-silk-muted">
                  {company.place}
                </p>
                <ol className="mt-7 space-y-10 border-l-2 border-copper-dim pl-7 sm:pl-9">
                  {company.roles.map((role) => (
                    <li key={role.period} className="relative">
                      <span
                        aria-hidden="true"
                        className="absolute -left-[35px] top-1 h-3 w-3 rounded-full border-[3px] border-copper bg-substrate-3 sm:-left-[43px]"
                      />
                      <p className="silk-label text-gold">{role.period}</p>
                      <h4 className="mt-1.5 text-lg font-bold text-silk">
                        {role.title}
                      </h4>
                      <p className="mt-2.5 max-w-2xl leading-relaxed text-silk-muted">
                        {role.body}
                      </p>
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ol>
          <h3 className="silk-label mb-6 mt-14 text-gold">Education</h3>
          <ul className="space-y-3">
            {education.map((ed) => (
              <li
                key={ed.title}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1"
              >
                <span className="silk-label text-copper">{ed.period}</span>
                <span className="font-bold text-silk">{ed.title}</span>
                <span className="text-sm text-silk-muted">
                  {ed.org}, {ed.place}
                </span>
              </li>
            ))}
          </ul>
        </Footprint>

        <Footprint id="work" refDes="U3" heading="Selected work">
          <div className="grid gap-5 sm:grid-cols-2">
            {caseStudies.map((cs, i) => (
              <Link
                key={cs.slug}
                href={`/work/${cs.slug}/`}
                className="module group flex flex-col p-6 pl-7"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="silk-label text-silk-muted">{cs.eyebrow}</p>
                  <span className="led mt-0.5 shrink-0" aria-hidden="true" />
                </div>
                <h3 className="display mt-4 text-2xl text-silk">{cs.title}</h3>
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
        </Footprint>

        <Footprint id="publications" refDes="U4" heading="Publications">
          <p className="max-w-2xl leading-relaxed text-silk-muted">
            {publications.length} peer-reviewed works — IEEE conference papers
            and journal articles — on federated learning, secure LLM
            deployment, and the cloud-native architecture of fuel systems.
          </p>
          <ul className="mt-8 space-y-5">
            {recentPubs.map((pub) => (
              <li key={pub.title} className="flex items-baseline gap-4">
                <span className="silk-label shrink-0 text-gold">
                  {pub.year}
                </span>
                <a
                  href={pub.doi ? `https://doi.org/${pub.doi}` : site.scholar}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="trace-link font-bold"
                >
                  {pub.title}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-8">
            <Link href="/publications/" className="silk-label text-gold">
              All {publications.length} publications →
            </Link>
          </p>
        </Footprint>

        <Footprint id="skills" refDes="U5" heading="Skills">
          <dl className="grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((group) => (
              <div key={group.domain}>
                <dt className="silk-label mb-3 flex items-center gap-2.5 text-gold">
                  <span
                    aria-hidden="true"
                    className="inline-block h-2.5 w-2.5 rounded-full border-2 border-copper bg-substrate-3"
                  />
                  {group.domain}
                </dt>
                <dd className="text-sm leading-7 text-silk-muted">
                  {group.items.join(" · ")}
                </dd>
              </div>
            ))}
          </dl>
        </Footprint>

        <Footprint id="contact" refDes="U6" heading="Contact">
          <p className="display max-w-3xl text-3xl text-silk sm:text-5xl">
            Building something with hard edges — payments, devices, telemetry?
            Let&apos;s talk.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a href={`mailto:${site.email}`} className="pad normal-case">
              {site.email}
            </a>
            <a
              href={site.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="pad-nc"
            >
              LinkedIn
            </a>
          </div>
          <p className="silk-label mt-10 text-silk-muted">
            {site.location} · UTC−6
          </p>
        </Footprint>
      </div>
    </main>
  );
}
