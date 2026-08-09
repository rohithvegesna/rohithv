import Link from "next/link";
import NavLinks from "@/components/NavLinks";
import Palette from "@/components/Palette";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ground/92 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-0 px-5 py-1.5 sm:px-10">
        <Link href="/" className="flex items-center gap-2.5 py-2">
          {/* packet-on-trace mark */}
          <svg viewBox="0 0 26 12" className="h-3.5 w-8" aria-hidden="true">
            <path d="M0 6 H26" stroke="var(--line)" strokeWidth="2" />
            <circle cx="16" cy="6" r="3.4" fill="var(--amber)" />
          </svg>
          <span className="tag text-fg">Rohith&nbsp;Varma&nbsp;Vegesna</span>
        </Link>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0 sm:gap-x-6">
          <NavLinks />
          <Palette />
        </div>
      </div>
    </header>
  );
}
