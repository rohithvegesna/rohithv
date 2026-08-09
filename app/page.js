import Crest from "@/components/Crest";
import FlipStat from "@/components/FlipStat";
import AboutSection from "@/components/sections/AboutSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import WorkGrid from "@/components/sections/WorkGrid";
import PublicationsPreview from "@/components/sections/PublicationsPreview";
import SkillsSection from "@/components/sections/SkillsSection";
import ContactSection from "@/components/sections/ContactSection";
import { site } from "@/data/site";
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

function PayArcs() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="arcs h-4 w-4"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M9 10.7 a1.8 1.8 0 0 1 0-1.4" />
      <path d="M6 12.5 a4.5 4.5 0 0 1 0-5" />
      <path d="M3.5 15 a8 8 0 0 1 0-10" />
    </svg>
  );
}

function Section({ id, heading, children }) {
  return (
    <section
      aria-labelledby={id}
      className="mx-auto max-w-6xl px-5 py-14 sm:px-10 sm:py-20"
    >
      <h2 id={id} className="strip-sign section-h !text-[1.05rem]">
        {heading}
      </h2>
      <div className="mt-9">{children}</div>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero — the station road sign frames the introduction. */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pt-14 sm:px-10 sm:pt-20 lg:grid-cols-[1.35fr_1fr]">
        <div>
          <p className="sign-label flex flex-wrap items-center gap-x-3 gap-y-1 text-green">
            {site.role} · {site.company} · {site.location}
          </p>
          <h1 className="display mt-4 text-[clamp(2.7rem,5.6vw,4.7rem)] uppercase text-ink">
            Rohith Varma <span className="text-green">Vegesna</span>
          </h1>
          <p className="mt-6 max-w-2xl text-2xl font-bold leading-snug text-ink sm:text-[1.7rem]">
            I build the systems that let a fuel dispenser{" "}
            <span className="text-green">take a payment.</span>
          </p>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-steel">
            EMV at the pump, edge devices in the field, and the AWS backbone
            behind fuel-station automation for major U.S. retail brands — with{" "}
            {publications.length} peer-reviewed publications along the way.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href={`mailto:${site.email}`} className="pill cta-pay">
              <PayArcs />
              Email me
            </a>
            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              className="pill-outline"
            >
              GitHub
            </a>
            <a
              href={site.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="pill-outline"
            >
              LinkedIn
            </a>
          </div>
        </div>

        {/* the sign stack */}
        <div className="relative mx-auto w-full max-w-[17rem] lg:max-w-xs">
          <div className="enamel px-5 pb-1 pt-3">
            <Crest className="w-full" />
          </div>
          <div className="enamel mt-3 px-5 py-5">
            <FlipStat
              digits={publications.length}
              caption="peer-reviewed publications"
            />
          </div>
          <div
            aria-hidden="true"
            className="mx-auto h-16 w-3.5 rounded-b-sm border-x-2 border-b-2 border-ink bg-chrome lg:h-24"
          />
        </div>
      </section>

      <hr className="lane mt-2" />

      <Section id="about" heading="About">
        <AboutSection />
      </Section>
      <hr className="lane" />
      <Section id="experience" heading="Experience">
        <ExperienceSection />
      </Section>
      <hr className="lane" />
      <Section id="work" heading="Selected work">
        <WorkGrid />
      </Section>
      <hr className="lane" />
      <Section id="publications" heading="Publications">
        <PublicationsPreview />
      </Section>
      <hr className="lane" />
      <Section id="skills" heading="Skills">
        <SkillsSection />
      </Section>
      <hr className="lane" />
      <Section id="contact" heading="Contact">
        <ContactSection />
      </Section>
    </main>
  );
}
