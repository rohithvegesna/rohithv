"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/work/", label: "Work" },
  { href: "/publications/", label: "Publications" },
  { href: "/press/", label: "Press" },
  { href: "/#contact", label: "Contact" },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main">
      <ul className="silk-label flex items-center gap-3 sm:gap-6">
        {nav.map((item) => {
          const section = item.href.split("#")[0];
          const active =
            section !== "/" && pathname.startsWith(section) ? "page" : undefined;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active}
                className="nav-link text-silk-muted hover:text-silk"
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
