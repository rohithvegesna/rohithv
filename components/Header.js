import Link from "next/link";
import Palette from "@/components/Palette";

const nav = [
  { href: "/work/", label: "Work" },
  { href: "/publications/", label: "Publications" },
  { href: "/press/", label: "Press" },
  { href: "/#contact", label: "Contact" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-silk/15 bg-substrate/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-0 px-5 py-2 sm:px-10">
        <Link
          href="/"
          className="silk-label flex items-center gap-2.5 py-2 text-silk"
        >
          <span className="led led-on" aria-hidden="true" />
          Rohith&nbsp;Varma&nbsp;Vegesna
        </Link>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0 sm:gap-x-6">
          <nav aria-label="Main">
            <ul className="silk-label flex items-center gap-3 sm:gap-6">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="finger text-silk-muted transition-colors hover:text-silk"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Palette />
        </div>
      </div>
    </header>
  );
}
