"use client";

import { useEffect, useRef, useState } from "react";
import { caseStudies } from "@/data/work";
import { site } from "@/data/site";

/*
  Search — hand-rolled command palette on <dialog> (native focus trap,
  Esc close, backdrop). Cmd/Ctrl+K or the header pad opens it.
*/

const NETS = [
  { group: "Pages", label: "Home", href: "/" },
  { group: "Pages", label: "Work", href: "/work/" },
  { group: "Pages", label: "Publications", href: "/publications/" },
  { group: "Pages", label: "Press", href: "/press/" },
  { group: "Pages", label: "About", href: "/#about" },
  { group: "Pages", label: "Experience", href: "/#experience" },
  { group: "Pages", label: "Skills", href: "/#skills" },
  { group: "Pages", label: "Contact", href: "/#contact" },
  ...caseStudies.map((cs) => ({
    group: "Case studies",
    label: cs.title,
    href: `/work/${cs.slug}/`,
  })),
  { group: "Links", label: "GitHub", href: site.github, external: true },
  { group: "Links", label: "LinkedIn", href: site.linkedin, external: true },
  { group: "Links", label: "Scholar", href: site.scholar, external: true },
  { group: "Links", label: "Copy email address", action: "copy-email" },
];

function matches(query, label) {
  const q = query.toLowerCase().replace(/\s+/g, "");
  const l = label.toLowerCase();
  if (!q) return true;
  let i = 0;
  for (const ch of l) if (ch === q[i]) i++;
  return i >= q.length;
}

export default function Palette() {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [copied, setCopied] = useState(false);

  const hits = NETS.filter((n) => matches(query, n.label));
  const active = hits[Math.min(cursor, hits.length - 1)];

  const open = () => {
    setQuery("");
    setCursor(0);
    setCopied(false);
    dialogRef.current.showModal();
    inputRef.current.focus();
  };

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const d = dialogRef.current;
        if (d.open) d.close();
        else open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const run = (net) => {
    if (!net) return;
    if (net.action === "copy-email") {
      navigator.clipboard?.writeText(site.email);
      setCopied(true);
      return;
    }
    dialogRef.current.close();
    if (net.external) window.open(net.href, "_blank", "noopener");
    else window.location.assign(net.href);
  };

  const onInputKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(active);
    }
  };

  const rows = hits.map((n, i) => ({
    net: n,
    showHeader: i === 0 || hits[i - 1].group !== n.group,
  }));

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="silk-label my-1.5 flex items-center gap-2 border border-silk/25 px-2.5 py-1.5 text-silk-muted transition-colors hover:border-gold hover:text-silk"
      >
        Search
        <kbd className="hidden rounded-[1px] border border-silk/25 px-1 py-0.5 text-[0.6rem] sm:inline-block">
          ⌘K
        </kbd>
      </button>
      <dialog
        ref={dialogRef}
        className="probe"
        aria-label="Search"
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current.close();
        }}
      >
        <div className="border-b border-silk/15 p-3">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
              setCopied(false);
            }}
            onKeyDown={onInputKey}
            role="combobox"
            aria-expanded="true"
            aria-controls="probe-list"
            aria-activedescendant={active ? `net-${NETS.indexOf(active)}` : undefined}
            aria-label="Search pages"
            placeholder="Search pages…"
            className="w-full bg-transparent font-mono text-sm tracking-wide text-silk placeholder:text-silk-muted focus:outline-none"
          />
        </div>
        <ul
          id="probe-list"
          role="listbox"
          aria-label="Pages"
          className="max-h-[46vh] overflow-y-auto p-2"
        >
          {rows.map(({ net: n, showHeader }) => {
            const idx = NETS.indexOf(n);
            const isActive = n === active;
            return [
              showHeader ? (
                <li
                  key={`g-${n.group}`}
                  role="presentation"
                  className="silk-label px-2 pb-1 pt-3 text-[0.6rem] text-silk-muted first:pt-1"
                >
                  {n.group}
                </li>
              ) : null,
              <li
                key={n.label}
                id={`net-${idx}`}
                role="option"
                aria-selected={isActive}
                onClick={() => run(n)}
                onMouseMove={() => setCursor(hits.indexOf(n))}
                className={`flex cursor-pointer items-center justify-between gap-3 px-2 py-1.5 font-mono text-sm ${
                  isActive ? "bg-gold text-substrate" : "text-silk"
                }`}
              >
                <span>
                  {n.action === "copy-email" && copied ? "Copied" : n.label}
                </span>
                {n.external ? (
                  <span aria-hidden="true" className="text-[0.65rem] opacity-70">
                    ↗
                  </span>
                ) : null}
              </li>,
            ];
          })}
          {hits.length === 0 ? (
            <li role="presentation" className="px-2 py-3 font-mono text-sm text-silk-muted">
              No results
            </li>
          ) : null}
        </ul>
        <p className="silk-label border-t border-silk/15 px-3 py-2 text-[0.6rem] text-silk-muted">
          ↑↓ move · ↵ jump · esc close
        </p>
      </dialog>
    </>
  );
}
