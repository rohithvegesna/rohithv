import { site } from "@/data/site";

const links = [
  { href: `mailto:${site.email}`, label: "Email" },
  { href: site.github, label: "GitHub" },
  { href: site.linkedin, label: "LinkedIn" },
  { href: site.scholar, label: "Scholar" },
];

/* Engineering-drawing title block. */
export default function Footer() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-5 pb-10 pt-16 sm:px-10">
      <div className="titleblock grid grid-cols-2 sm:grid-cols-[1.6fr_repeat(3,minmax(0,0.7fr))_1.6fr]">
        <div className="border-b border-r p-3 sm:border-b-0">
          <p className="tb-label">Title</p>
          <p className="tb-value">ROHITHV.COM</p>
        </div>
        <div className="border-b p-3 sm:border-b-0 sm:border-r">
          <p className="tb-label">Rev</p>
          <p className="tb-value">C</p>
        </div>
        <div className="border-r p-3 max-sm:border-b">
          <p className="tb-label">Date</p>
          <p className="tb-value">2026-08</p>
        </div>
        <div className="p-3 max-sm:border-b sm:border-r">
          <p className="tb-label">Sheet</p>
          <p className="tb-value">1/1</p>
        </div>
        <div className="col-span-2 border-t p-3 sm:col-span-1 sm:border-t-0">
          <p className="tb-label">Nets</p>
          <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="silk-label text-copper transition-colors hover:text-gold-bright"
                  {...(l.href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="silk-label mt-3 flex flex-wrap items-center gap-2 text-silk-muted">
        <span className="tb-label">Drawn</span>
        <span>
          © {new Date().getFullYear()} {site.name} · {site.location}
        </span>
      </p>
    </footer>
  );
}
