import Link from "next/link";
import MiniTrace from "@/components/MiniTrace";

/*
  One case-study card, shared by the home grid, the work index, and the
  "more work" rail on each case study. `stub` draws the short line joining
  the card to the spine; index pages have no spine, so they turn it off.
*/
export default function WorkCard({
  cs,
  seed = 0,
  HeadingTag = "h3",
  stub = true,
}) {
  return (
    <Link
      href={`/work/${cs.slug}/`}
      className={`branch group flex flex-col p-6 sm:p-7 ${stub ? "" : "branch-free"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="tag text-muted">{cs.eyebrow}</p>
        <span className="dg-dot mt-1 shrink-0" aria-hidden="true" />
      </div>
      <div className="mt-5">
        <MiniTrace stages={cs.stages} seed={seed} />
      </div>
      <HeadingTag className="mt-5 text-xl font-semibold leading-snug text-fg">
        {cs.title}
      </HeadingTag>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
        {cs.summary}
      </p>
      <p className="tag mt-6 flex items-center gap-2 text-amber">
        Read case study
        <span
          aria-hidden="true"
          className="mono transition-transform duration-150 group-hover:translate-x-1"
        >
          →
        </span>
      </p>
    </Link>
  );
}
