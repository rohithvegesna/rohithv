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

/* Sheet zone: a labeled region of the schematic sheet. */
function Zone({ label, children }) {
  return (
    <section className="mt-12">
      <h2 className="silk-label mb-5 flex items-center gap-3 text-gold">
        <span
          aria-hidden="true"
          className="inline-block h-0.5 w-8 bg-copper"
        />
        {label}
      </h2>
      {children}
    </section>
  );
}

export default async function CaseStudy({ params }) {
  const { slug } = await params;
  const cs = caseStudies.find((c) => c.slug === slug);
  if (!cs) notFound();

  const idx = caseStudies.indexOf(cs);
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
      <nav aria-label="Breadcrumb" className="silk-label mb-8">
        <Link
          href="/work/"
          className="text-silk-muted transition-colors hover:text-silk"
        >
          ← Work
        </Link>
      </nav>

      {/* the schematic sheet */}
      <article className="sheet relative px-5 py-10 sm:px-12 sm:py-12">
        <div className="sheet-coords top" aria-hidden="true">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
        </div>
        <div className="sheet-coords side" aria-hidden="true">
          <span className="flex-1 pt-2">A</span>
          <span className="flex-1">B</span>
          <span className="flex-1">C</span>
          <span className="flex-1">D</span>
        </div>

        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="silk-label text-copper">{cs.eyebrow}</p>
            <h1 className="display mt-4 text-4xl text-silk sm:text-6xl">
              {cs.title}
            </h1>
          </div>
          <span className="designator mt-1" aria-hidden="true">
            SH{idx + 1}
          </span>
        </header>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-silk-muted">
          {cs.summary}
        </p>
        <p className="silk-label mt-6 border-y border-silk/15 py-3 text-silk-muted">
          {cs.stack.join(" · ")}
        </p>

        <Zone label="Problem">
          <div className="max-w-2xl space-y-4 leading-relaxed text-silk">
            {cs.problem.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </div>
        </Zone>

        <Zone label="Constraints">
          <ul className="vias max-w-2xl space-y-4">
            {cs.constraints.map((c) => (
              <li key={c.slice(0, 32)} className="leading-relaxed text-silk">
                {c}
              </li>
            ))}
          </ul>
        </Zone>

        <Zone label="Architecture">
          <div className="max-w-2xl space-y-4 leading-relaxed text-silk">
            {cs.architecture.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </div>
        </Zone>

        <Zone label="Outcome">
          <ul className="vias max-w-2xl space-y-4">
            {cs.outcome.map((o) => (
              <li
                key={o.slice(0, 32)}
                className={`leading-relaxed ${
                  o.startsWith("TODO:") ? "italic text-silk-muted" : "text-silk"
                }`}
              >
                {o}
              </li>
            ))}
          </ul>
        </Zone>
      </article>

      <nav aria-label="More case studies" className="mt-12">
        <h2 className="silk-label mb-5 text-gold">More work</h2>
        <ul className="space-y-3">
          {others.map((o) => (
            <li key={o.slug}>
              <Link href={`/work/${o.slug}/`} className="trace-link font-bold">
                {o.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
