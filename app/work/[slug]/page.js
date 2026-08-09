import Link from "next/link";
import { notFound } from "next/navigation";
import { caseStudies } from "@/data/work";
import { site } from "@/data/site";

export function generateStaticParams() {
  return caseStudies.map((cs) => ({ slug: cs.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const cs = caseStudies.find((c) => c.slug === slug);
  if (!cs) return {};
  return {
    title: { absolute: `${cs.title} — case study` },
    description: cs.summary.slice(0, 155),
    alternates: { canonical: `/work/${cs.slug}/` },
    openGraph: {
      title: cs.title,
      description: cs.summary.slice(0, 155),
      url: `/work/${cs.slug}/`,
      images: [{ url: "/og.png", width: 1200, height: 630 }],
      type: "article",
    },
  };
}

function Zone({ label, children }) {
  return (
    <section className="mt-14">
      <h2 className="strip-sign sign-label !text-[0.8rem]">{label}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default async function CaseStudy({ params }) {
  const { slug } = await params;
  const cs = caseStudies.find((c) => c.slug === slug);
  if (!cs) notFound();

  const others = caseStudies.filter((c) => c.slug !== slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: cs.title,
    description: cs.summary,
    url: `${site.url}/work/${cs.slug}/`,
    author: { "@type": "Person", name: site.name, url: site.url },
  };

  return (
    <main className="mx-auto max-w-4xl px-5 py-12 sm:px-10 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="sign-label mb-10">
        <Link
          href="/work/"
          className="text-steel transition-colors hover:text-ink"
        >
          ← Work
        </Link>
      </nav>

      <article>
        <p className="sign-label text-green">{cs.eyebrow}</p>
        <h1 className="display mt-4 text-4xl text-ink sm:text-6xl">
          {cs.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-steel">
          {cs.summary}
        </p>
        <p className="sign-label mt-7 border-y border-ink/15 py-3 text-steel">
          {cs.stack.join(" · ")}
        </p>

        <Zone label="Problem">
          <div className="max-w-2xl space-y-4 leading-relaxed text-ink">
            {cs.problem.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </div>
        </Zone>

        <Zone label="Constraints">
          <ul className="checks max-w-2xl space-y-4">
            {cs.constraints.map((c) => (
              <li key={c.slice(0, 32)} className="leading-relaxed text-ink">
                {c}
              </li>
            ))}
          </ul>
        </Zone>

        <Zone label="Architecture">
          <div className="max-w-2xl space-y-4 leading-relaxed text-ink">
            {cs.architecture.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </div>
        </Zone>

        <Zone label="Outcome">
          <ul className="checks max-w-2xl space-y-4">
            {cs.outcome.map((o) => (
              <li
                key={o.slice(0, 32)}
                className={`leading-relaxed ${
                  o.startsWith("TODO:") ? "italic text-steel" : "text-ink"
                }`}
              >
                {o}
              </li>
            ))}
          </ul>
        </Zone>
      </article>

      <nav
        aria-label="More case studies"
        className="mt-16 border-t border-ink/15 pt-10"
      >
        <h2 className="mb-5 text-xl font-bold text-ink">More work</h2>
        <ul className="space-y-3">
          {others.map((o) => (
            <li key={o.slug}>
              <Link href={`/work/${o.slug}/`} className="u-link font-bold">
                {o.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
