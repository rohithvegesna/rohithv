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
      <ul className="tag flex flex-wrap items-center gap-x-3 gap-y-0 sm:gap-x-6">
        {nav.map((item) => {
          const section = item.href.split("#")[0];
          const active =
            section !== "/" && pathname.startsWith(section) ? "page" : undefined;
          return (
            <li key={item.href}>
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
