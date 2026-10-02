"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/work/", label: "Work" },
  { href: "/publications/", label: "Publications" },
  { href: "/press/", label: "Press" },
  { href: "/play/", label: "Play" },
  /* on phones the contact link is the hero's Email button and the footer */
  { href: "/#contact", label: "Contact", phone: false },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main">
      <ul className="tag flex flex-wrap items-center gap-x-2.5 gap-y-0 sm:gap-x-6">
        {nav.map((item) => {
          const section = item.href.split("#")[0];
          const active =
            section !== "/" && pathname.startsWith(section) ? "page" : undefined;
          return (
            <li key={item.href} className={item.phone === false ? "hidden sm:block" : ""}>
              <Link
                href={item.href}
                aria-current={active}
                className="nav-link text-muted hover:text-fg"
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
