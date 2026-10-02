import Link from "next/link";

/*
  Readouts — the headline figures as a row of instruments. The page derives
  every value from the data files at build time; nothing here runs in the
  browser, so the numbers are right in the first paint, in screenshots, and
  in print.
*/
export default function Readouts({ items }) {
  return (
    <ul
      className="readouts mt-10 grid grid-cols-2 border-y border-line sm:grid-cols-4"
      aria-label="At a glance"
    >
      {items.map((it) => (
        <li key={it.label} className="readout">
          <Link
            href={it.href}
            className="block px-4 py-5 transition-colors hover:bg-raised/60 sm:px-6"
          >
            <span className="readout-v block text-fg">
              {it.value}
              {it.suffix ? <span className="text-amber">{it.suffix}</span> : null}
            </span>
            <span className="tag mt-2 block text-muted">{it.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
