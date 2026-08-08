import { site } from "@/data/site";

const links = [
  { href: `mailto:${site.email}`, label: "Email" },
  { href: site.github, label: "GitHub" },
  { href: site.linkedin, label: "LinkedIn" },
  { href: site.scholar, label: "Scholar" },
];

export default function Footer() {
  return (
    <footer className="border-t border-silk/12">
      <div className="silk-label mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-5 py-7 text-silk-muted sm:px-10">
        <p>
          © {new Date().getFullYear()} {site.name} · {site.location}
        </p>
        <ul className="flex flex-wrap items-center gap-5">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="transition-colors hover:text-silk"
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
