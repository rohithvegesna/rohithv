"use client";

import { useState } from "react";
import {
  publications,
  SCHOLAR_URL,
  isIEEE,
  pubsByYear,
} from "@/data/publications";
import PubChart from "@/components/PubChart";

/*
  Filter row → chart → list. The chips scope everything below them; a year
  chosen on the chart narrows the list further. Numbering stays fixed to the
  full list (001 is always the newest paper) so a filtered view still reads
  as a slice of the whole.
*/
const isConference = (p) => /conference/i.test(p.venue);
const soloAuthor = (p) => p.authors === "RV Vegesna";

const FILTERS = [
  { id: "all", label: "All", test: () => true },
  { id: "ieee", label: "IEEE", test: isIEEE },
  { id: "conference", label: "Conference", test: isConference },
  { id: "journal", label: "Journal", test: (p) => !isConference(p) },
  { id: "coauthored", label: "Co-authored", test: (p) => !soloAuthor(p) },
];
const COUNTS = Object.fromEntries(
  FILTERS.map((f) => [f.id, publications.filter(f.test).length])
);
const ITEM_NO = new Map(publications.map((p, i) => [p.title, i + 1]));

export default function PublicationsExplorer() {
  const [filterId, setFilterId] = useState("all");
  const [year, setYear] = useState(null);

  const filter = FILTERS.find((f) => f.id === filterId);
  const scoped = publications.filter(filter.test);
  const visible = year == null ? scoped : scoped.filter((p) => p.year === year);
  const years = [...new Set(visible.map((p) => p.year))].sort((a, b) => b - a);
  const narrowed = filterId !== "all" || year != null;
  const clear = () => {
    setFilterId("all");
    setYear(null);
  };

  return (
    <div>
      <div
        role="group"
        aria-label="Filter publications"
        className="flex flex-wrap gap-2"
      >
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className="chip chip-btn"
            aria-pressed={filterId === f.id}
            onClick={() => setFilterId(f.id)}
          >
            {f.label}
            <span className="opacity-70">{COUNTS[f.id]}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 max-w-2xl">
        <PubChart
          data={pubsByYear(scoped)}
          selected={year}
          onSelect={(y) => setYear((cur) => (cur === y ? null : y))}
        />
      </div>

      <p
        className="tag mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted"
        role="status"
        aria-live="polite"
      >
        <span>
          Showing {visible.length} of {publications.length}
          {filterId !== "all" ? ` · ${filter.label}` : ""}
          {year != null ? ` · ${year}` : ""}
        </span>
        {narrowed ? (
          <button
            type="button"
            onClick={clear}
            className="u-link cursor-pointer uppercase"
          >
            Clear
          </button>
        ) : null}
      </p>

      {visible.length === 0 ? (
        <p className="mt-12 leading-relaxed text-muted">
          Nothing matches that combination —{" "}
          <button
            type="button"
            onClick={clear}
            className="u-link cursor-pointer"
          >
            clear the filters
          </button>
          .
        </p>
      ) : null}

      {years.map((yr) => (
        <section key={yr} className="mt-12">
          <h2 className="tag mb-6 flex items-center gap-3 text-amber">
            <span aria-hidden="true" className="inline-block h-0.5 w-8 bg-amber" />
            {yr}
          </h2>
          <ul className="space-y-0">
            {visible
              .filter((p) => p.year === yr)
              .map((pub) => (
                <li
                  key={pub.title}
                  className="grid grid-cols-[2.6rem_1fr] gap-x-4 border-t border-line/70 py-5 last:border-b sm:grid-cols-[3.2rem_1fr_auto]"
                >
                  <span className="tag pt-1 text-muted" aria-hidden="true">
                    {String(ITEM_NO.get(pub.title)).padStart(3, "0")}
                  </span>
                  <div>
                    <a
                      href={pub.doi ? `https://doi.org/${pub.doi}` : SCHOLAR_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="u-link font-bold leading-snug"
                    >
                      {pub.title}
                    </a>
                    {!soloAuthor(pub) && (
                      <p className="mt-1.5 text-sm text-muted">{pub.authors}</p>
                    )}
                    <p className="mt-1 text-sm text-muted">{pub.venue}</p>
                    <p className="tag mt-2 break-all text-muted">
                      {pub.doi
                        ? `doi:${pub.doi.toLowerCase()}`
                        : "via google scholar"}
                      {pub.citedBy > 0 ? ` · cited by ${pub.citedBy}` : ""}
                    </p>
                  </div>
                  {isIEEE(pub) ? (
                    <span className="tag col-start-2 mt-2 h-fit w-fit border border-amber/60 px-1.5 py-0.5 text-amber sm:col-start-3 sm:mt-1">
                      IEEE
                    </span>
                  ) : null}
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
