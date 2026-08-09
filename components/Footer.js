import { site } from "@/data/site";

const links = [
  { href: `mailto:${site.email}`, label: "Email" },
  { href: site.github, label: "GitHub" },
  { href: site.linkedin, label: "LinkedIn" },
  { href: site.scholar, label: "Scholar" },
];

/* The salvaged receipt — the footer prints like a pump ticket. */
export default function Footer() {
  return (
    <footer className="mt-20 flex justify-center px-5 pb-14">
      <div className="w-full max-w-md">
        <div className="receipt-edge" aria-hidden="true" />
        <div className="receipt px-6 py-5 text-[0.82rem] leading-relaxed">
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-1">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="u-link font-bold"
                  {...(l.href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-dashed border-ink/40 pt-3 text-center text-[0.74rem]">
            © {new Date().getFullYear()} {site.name} · {site.location}
          </p>
        </div>
      </div>
    </footer>
  );
}
