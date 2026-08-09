import { site } from "@/data/site";

export default function ContactSection() {
  return (
    <>
      <p className="display max-w-3xl text-4xl text-fg sm:text-5xl">
        Building something with hard edges — payments, devices, telemetry?
        Let&apos;s talk.
      </p>
      <div className="mt-9 flex flex-wrap items-center gap-3">
        <a href={`mailto:${site.email}`} className="btn">
          {site.email}
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
      <p className="tag mt-10 text-muted">
        {site.location} · UTC−6
      </p>
    </>
  );
}
