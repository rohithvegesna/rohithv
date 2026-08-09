import Link from "next/link";
import { publications } from "@/data/publications";
import { site } from "@/data/site";

export default function PublicationsPreview() {
  const recentPubs = publications.slice(0, 3);
  return (
    <>
      <p className="max-w-2xl leading-relaxed text-steel">
        {publications.length} peer-reviewed works — IEEE conference papers and
        journal articles — on federated learning, secure LLM deployment, and
        the cloud-native architecture of fuel systems.
      </p>
      <ul className="mt-8 space-y-5">
        {recentPubs.map((pub) => (
          <li key={pub.title} className="flex items-baseline gap-4">
            <span className="sign-label shrink-0 text-green">{pub.year}</span>
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
        <Link href="/publications/" className="sign-label text-green">
          All {publications.length} publications →
        </Link>
      </p>
    </>
  );
}
