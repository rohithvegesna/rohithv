import Link from "next/link";

const nav = [
  { href: "/work/", label: "Work" },
  { href: "/publications/", label: "Publications" },
  { href: "/press/", label: "Press" },
  { href: "/#contact", label: "Contact" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-3 sm:px-8">
        <Link
          href="/"
          className="readout flex items-center gap-2 font-medium text-ink"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-amber pulse-dot" aria-hidden="true" />
          Rohith&nbsp;Varma&nbsp;Vegesna
        </Link>
        <nav aria-label="Main">
          <ul className="readout flex items-center gap-4 sm:gap-6">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted transition-colors hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
