import Link from "next/link";
import NavLinks from "@/components/NavLinks";
import Palette from "@/components/Palette";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-porcelain/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-0 px-5 py-1.5 sm:px-10">
        <Link
          href="/"
          className="flex items-center gap-2.5 py-1.5"
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
            <circle cx="12" cy="12" r="11" fill="var(--green)" stroke="var(--ink)" strokeWidth="1.5" />
            <path d="M12 5 L16.5 15 L12 12.6 L7.5 15 Z" fill="var(--porcelain)" />
          </svg>
          <span className="sign-label text-ink">Rohith&nbsp;Varma&nbsp;Vegesna</span>
        </Link>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0 sm:gap-x-6">
          <NavLinks />
          <Palette />
        </div>
      </div>
    </header>
  );
}
