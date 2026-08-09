import { site } from "@/data/site";

export default function ContactSection() {
  return (
    <>
      <p className="display max-w-3xl text-4xl text-ink sm:text-5xl">
        Building something with hard edges — payments, devices, telemetry?
        Let&apos;s talk.
      </p>
      <div className="mt-9 flex flex-wrap items-center gap-3">
        <a href={`mailto:${site.email}`} className="pill cta-pay">
          {site.email}
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
      <p className="sign-label mt-10 text-steel">
        {site.location} · UTC−6
      </p>
    </>
  );
}
