import { site } from "@/data/site";

const links = [
  { href: `mailto:${site.email}`, label: "Email" },
  { href: site.github, label: "GitHub" },
  { href: site.linkedin, label: "LinkedIn" },
  { href: site.scholar, label: "Scholar" },
];

/* The trace terminates settled: the slip. */
export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-10 gap-y-6 px-5 py-10 sm:px-10">
        <div className="slip px-5 py-4 text-[0.72rem] leading-relaxed">
          <p className="font-semibold tracking-[0.14em]">TXN SETTLED ✓</p>
          <p className="mt-1 opacity-80">
            © {new Date().getFullYear()} {site.name} · {site.location}
          </p>
        </div>
        <ul className="tag flex flex-wrap items-center gap-5 text-muted">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="transition-colors hover:text-amber"
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
    </footer>
  );
}
