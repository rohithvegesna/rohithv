import DeepTrace from "@/components/diagram/DeepTrace";
import Spine from "@/components/Spine";
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

function Dock({ id, heading, children }) {
  return (
    <section aria-labelledby={id} className="py-12 pl-6 sm:py-16 sm:pl-10">
      <div className="dock">
        <h2 id={id} className="dock-h">
          {heading}
        </h2>
      </div>
      <div className="mt-8 max-w-5xl">{children}</div>
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
      <Spine />

      {/* Hero — the facts first, framed by the living pipeline. */}
      <section className="mx-auto max-w-6xl px-5 pt-14 sm:px-10 sm:pt-20">
        <p className="tag flex flex-wrap items-center gap-x-3 gap-y-1 text-amber">
          {site.role} · {site.company} · {site.location}
        </p>
        <h1 className="display mt-5 max-w-3xl text-[clamp(1.9rem,4.2vw,3.3rem)] text-fg">
          I build the systems that let a fuel dispenser{" "}
          <span className="text-amber">take a payment.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          EMV at the pump, edge devices in the field, and the AWS backbone
          behind fuel-station automation for major U.S. retail brands — with{" "}
          {publications.length} peer-reviewed publications along the way.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href={`mailto:${site.email}`} className="btn">
            Email me
          </a>
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
          >
            GitHub
          </a>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
          >
            LinkedIn
          </a>
        </div>

        <div className="mt-12 sm:mt-16">
          <DeepTrace buildDate={new Date().toISOString().slice(0, 10)} />
        </div>
      </section>

      {/* The spine: the hero's main line continues down the page. */}
      <div className="spine mx-auto mt-8 max-w-6xl px-5 sm:px-10">
        <Dock id="about" heading="About">
          <AboutSection />
        </Dock>
        <Dock id="experience" heading="Experience">
          <ExperienceSection />
        </Dock>
        <Dock id="work" heading="Selected work">
          <WorkGrid />
        </Dock>
        <Dock id="publications" heading="Publications">
          <PublicationsPreview />
        </Dock>
        <Dock id="skills" heading="Skills">
          <SkillsSection />
        </Dock>
        <Dock id="contact" heading="Contact">
          <ContactSection />
        </Dock>
      </div>
    </main>
  );
}
