import Image from "next/image";
import Link from "next/link";
import Schematic from "@/components/Schematic";
import { site, experience, education, skills } from "@/data/site";
import { caseStudies } from "@/data/work";
import { publications } from "@/data/publications";

export const metadata = {
  title: "Rohith Varma Vegesna — Senior Software Engineer & Tech Lead",
  description:
    "Payment and IoT infrastructure for fuel retail at national scale: EMV at the dispenser, edge-to-cloud telemetry on AWS, and 24 peer-reviewed publications.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Rohith Varma Vegesna — Senior Software Engineer & Tech Lead",
    description:
      "Payment and IoT infrastructure for fuel retail at national scale.",
    url: "/",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
};

function SectionHeading({ id, children }) {
  return (
    <h2 id={id} className="readout mb-8 flex items-center gap-3 text-muted">
      <span className="inline-block h-px w-8 bg-line" aria-hidden="true" />
      {children}
    </h2>
  );
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${site.url}/#person`,
      name: site.name,
      url: site.url,
      image: `${site.url}/profile.png`,
      jobTitle: "Senior Software Engineer & Tech Lead",
      worksFor: { "@type": "Organization", name: site.company },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Dallas–Fort Worth",
        addressRegion: "TX",
        addressCountry: "US",
      },
      email: `mailto:${site.email}`,
      sameAs: [site.github, site.linkedin, site.orcid],
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

export default function Home() {
  const recentPubs = publications.slice(0, 3);
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-5 pt-16 pb-12 sm:px-8 sm:pt-24">
        <p className="readout mb-6 text-amber">
          {site.role} · {site.company} · {site.location}
        </p>
        <h1 className="display max-w-3xl text-4xl font-bold leading-[1.05] sm:text-5xl md:text-6xl">
          I build the systems that let a fuel dispenser take a payment.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          EMV at the pump, edge devices in the field, and the AWS backbone
          behind fuel-station automation for major U.S. retail brands — with{" "}
          {publications.length} peer-reviewed publications along the way.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href={`mailto:${site.email}`}
            className="rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
          >
            Email me
          </a>
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm border border-line px-5 py-2.5 text-sm font-semibold transition-colors hover:border-accent"
          >
            GitHub
          </a>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm border border-line px-5 py-2.5 text-sm font-semibold transition-colors hover:border-accent"
          >
            LinkedIn
          </a>
          <a
            href="#experience"
            className="rounded-sm border border-line px-5 py-2.5 text-sm font-semibold transition-colors hover:border-accent"
          >
            Resume
          </a>
        </div>
        <div className="mt-16">
          <Schematic />
        </div>
      </section>

      {/* About */}
      <section
        aria-labelledby="about"
        className="border-t border-line bg-surface"
      >
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
          <SectionHeading id="about">About</SectionHeading>
          <div className="flex flex-col gap-10 md:flex-row md:items-start">
            <figure className="shrink-0">
              <div className="w-40 overflow-hidden rounded-sm border border-line bg-surface-2 sm:w-48">
                <Image
                  src="/profile.png"
                  alt="Portrait of Rohith Varma Vegesna"
                  width={192}
                  height={192}
                  priority={false}
                />
              </div>
              <figcaption className="readout mt-2 text-muted">
                Fig. 02 — DFW, TX
              </figcaption>
            </figure>
            <div className="max-w-2xl space-y-4 leading-relaxed">
              <p>
                I lead engineering on 7-Eleven&apos;s DEX/FuelControl platform:
                secure, IoT-driven fuel-station automation covering EMV payment
                processing at the dispenser and edge-to-cloud connectivity
                across major fuel retail brands. My team owns the path a fuel
                transaction takes from pump hardware to AWS — and I own the
                hiring, delivery, and architecture that keep it running.
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
        </div>
      </section>

      {/* Experience */}
      <section aria-labelledby="experience" className="border-t border-line">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
          <SectionHeading id="experience">Experience</SectionHeading>
          <ol className="space-y-10 border-l border-line pl-6 sm:pl-8">
            {experience.map((job) => (
              <li key={job.period} className="relative">
                <span
                  className="absolute -left-[29px] top-1.5 h-2 w-2 rounded-full border border-accent bg-bg sm:-left-[37px]"
                  aria-hidden="true"
                />
                <p className="readout text-amber">{job.period}</p>
                <h3 className="display mt-1 text-lg font-semibold">
                  {job.title}
                </h3>
                <p className="readout mt-1 text-muted">
                  {job.org} · {job.place}
                </p>
                <p className="mt-3 max-w-2xl leading-relaxed text-muted">
                  {job.body}
                </p>
              </li>
            ))}
          </ol>
          <h3 className="readout mt-14 mb-6 text-muted">Education</h3>
          <ul className="space-y-3">
            {education.map((ed) => (
              <li
                key={ed.title}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1"
              >
                <span className="readout w-12 text-amber">{ed.period}</span>
                <span className="font-medium">{ed.title}</span>
                <span className="text-sm text-muted">
                  {ed.org}, {ed.place}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Selected work */}
      <section
        aria-labelledby="work"
        className="border-t border-line bg-surface"
      >
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
          <SectionHeading id="work">Selected work</SectionHeading>
          <div className="grid gap-5 sm:grid-cols-2">
            {caseStudies.map((cs) => (
              <Link
                key={cs.slug}
                href={`/work/${cs.slug}/`}
                className="group flex flex-col rounded-sm border border-line bg-bg p-6 transition-colors hover:border-accent"
              >
                <p className="readout text-muted">{cs.eyebrow}</p>
                <h3 className="display mt-3 text-xl font-semibold">
                  {cs.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                  {cs.summary}
                </p>
                <p className="readout mt-5 text-accent">
                  Read case study{" "}
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Publications preview */}
      <section aria-labelledby="publications" className="border-t border-line">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
          <SectionHeading id="publications">Publications</SectionHeading>
          <p className="max-w-2xl leading-relaxed text-muted">
            {publications.length} peer-reviewed works — IEEE conference papers
            and journal articles — on federated learning, secure LLM
            deployment, and the cloud-native architecture of fuel systems.
          </p>
          <ul className="mt-8 space-y-4">
            {recentPubs.map((pub) => (
              <li key={pub.doi} className="flex items-baseline gap-4">
                <span className="readout shrink-0 text-amber">{pub.year}</span>
                <a
                  href={`https://doi.org/${pub.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline decoration-line underline-offset-4 transition-colors hover:decoration-accent"
                >
                  {pub.title}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-8">
            <Link href="/publications/" className="readout text-accent">
              All {publications.length} publications →
            </Link>
          </p>
        </div>
      </section>

      {/* Skills */}
      <section
        aria-labelledby="skills"
        className="border-t border-line bg-surface"
      >
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
          <SectionHeading id="skills">Skills</SectionHeading>
          <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((group) => (
              <div key={group.domain}>
                <dt className="readout mb-3 text-amber">{group.domain}</dt>
                <dd className="text-sm leading-7 text-muted">
                  {group.items.join(" · ")}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Contact */}
      <section aria-labelledby="contact" className="border-t border-line">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8">
          <SectionHeading id="contact">Contact</SectionHeading>
          <p className="display max-w-2xl text-3xl font-bold sm:text-4xl">
            Building something with hard edges — payments, devices, telemetry?
            Let&apos;s talk.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${site.email}`}
              className="rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
            >
              {site.email}
            </a>
            <a
              href={site.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm border border-line px-5 py-2.5 text-sm font-semibold transition-colors hover:border-accent"
            >
              LinkedIn
            </a>
          </div>
          <p className="readout mt-10 text-muted">
            {site.location} · UTC−6
          </p>
        </div>
      </section>
    </main>
  );
}
