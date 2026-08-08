import Schematic from "@/components/Schematic";
import GameGate from "@/components/game/GameGate";
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

function Section({ id, heading, children }) {
  return (
    <section
      aria-labelledby={id}
      className="mx-auto max-w-6xl px-5 py-16 sm:px-10 sm:py-24"
    >
      <h2 id={id} className="section-h">
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

      {/* Instant HTML hero — the 5-second test lives here, game or not. */}
      <section className="mx-auto max-w-6xl px-5 pt-16 sm:px-10 sm:pt-24">
        <p className="silk-label flex flex-wrap items-center gap-x-3 gap-y-1 text-copper">
          <span className="led led-on" aria-hidden="true" />
          {site.role} · {site.company} · {site.location}
        </p>
        <h1 className="display mt-5 text-[clamp(3.2rem,10vw,7.5rem)] uppercase leading-[0.92] text-silk">
          Rohith Varma <span className="text-gold">Vegesna</span>
        </h1>
        <p className="mt-7 max-w-3xl text-2xl font-bold leading-snug text-silk sm:text-3xl">
          I build the systems that let a fuel dispenser{" "}
          <span className="text-gold">take a payment.</span>
        </p>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-silk-muted">
          EMV at the pump, edge devices in the field, and the AWS backbone
          behind fuel-station automation for major U.S. retail brands — with{" "}
          {publications.length} peer-reviewed publications along the way.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
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

      <GameGate />

      <div id="classic-root">
        <div className="mx-auto max-w-6xl px-5 sm:px-10">
          <div className="mt-16 sm:mt-20">
            <Schematic />
          </div>
        </div>

        <div className="rail mx-auto mt-6 max-w-6xl sm:mt-10">
          <Section id="about" heading="About">
            <AboutSection />
          </Section>
          <Section id="experience" heading="Experience">
            <ExperienceSection />
          </Section>
          <Section id="work" heading="Selected work">
            <WorkGrid />
          </Section>
          <Section id="publications" heading="Publications">
            <PublicationsPreview />
          </Section>
          <Section id="skills" heading="Skills">
            <SkillsSection />
          </Section>
          <Section id="contact" heading="Contact">
            <ContactSection />
          </Section>
        </div>
      </div>
    </main>
  );
}
