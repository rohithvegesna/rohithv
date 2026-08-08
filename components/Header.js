import Link from "next/link";
import NavLinks from "@/components/NavLinks";
import Palette from "@/components/Palette";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-silk/12 bg-substrate/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-0 px-5 py-1.5 sm:px-10">
        <Link
          href="/"
          className="silk-label flex items-center gap-2.5 py-2 text-silk"
        >
          <span className="led led-on" aria-hidden="true" />
          Rohith&nbsp;Varma&nbsp;Vegesna
        </Link>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0 sm:gap-x-6">
          <NavLinks />
          <Palette />
        </div>
      </div>
    </header>
  );
}
