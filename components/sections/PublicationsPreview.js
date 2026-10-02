import Link from "next/link";
import PubChart from "@/components/PubChart";
import { publications, pubsByYear } from "@/data/publications";
import { site } from "@/data/site";

export default function PublicationsPreview() {
  const recentPubs = publications.slice(0, 3);
  const perYear = pubsByYear();
  const first = perYear[0].year;
  const last = perYear[perYear.length - 1].year;
  return (
    <div className="grid gap-10 md:grid-cols-[1fr_minmax(0,19rem)] md:items-start">
      <div>
        <p className="max-w-2xl leading-relaxed text-muted">
          {publications.length} peer-reviewed works — IEEE conference papers and
          journal articles — on federated learning, secure LLM deployment, and
          the cloud-native architecture of fuel systems.
        </p>
        <ul className="mt-8 space-y-5">
          {recentPubs.map((pub) => (
            <li key={pub.title} className="flex items-baseline gap-4">
              <span className="tag shrink-0 text-amber">{pub.year}</span>
              <a
                href={pub.doi ? `https://doi.org/${pub.doi}` : site.scholar}
                target="_blank"
                rel="noopener noreferrer"
                className="u-link font-bold"
              >
                {pub.title}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-8">
          <Link href="/publications/" className="tag text-amber">
            All {publications.length} publications →
          </Link>
        </p>
      </div>
      <Link
        href="/publications/"
        aria-label={`Papers per year, ${first} to ${last} — open the full list`}
        className="branch branch-free block p-5 md:mt-1"
      >
        <PubChart data={perYear} compact />
        <p className="tag mt-3 text-muted">
          Papers per year · {first}–{last}
        </p>
      </Link>
    </div>
  );
}
