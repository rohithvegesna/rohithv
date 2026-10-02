import Link from "next/link";
import { notFound } from "next/navigation";
import { caseStudies } from "@/data/work";
import { CaseFigure } from "@/components/diagram/diagrams";
import WorkCard from "@/components/WorkCard";
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
      <h2 className="dock-h flex items-center gap-3 !text-[1.05rem]">
        <span aria-hidden="true" className="inline-block h-0.5 w-7 bg-amber" />
        {label}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default async function CaseStudy({ params }) {
  const { slug } = await params;
  const cs = caseStudies.find((c) => c.slug === slug);
  if (!cs) notFound();

  /* the next two in sequence, so the rail stays an even pair of cards */
  const at = caseStudies.indexOf(cs);
  const next = [1, 2].map((k) => caseStudies[(at + k) % caseStudies.length]);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: cs.title,
        description: cs.summary,
        url: `${site.url}/work/${cs.slug}/`,
        image: `${site.url}/og.png`,
        mainEntityOfPage: `${site.url}/work/${cs.slug}/`,
        author: { "@type": "Person", name: site.name, url: site.url },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${site.url}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Work",
            item: `${site.url}/work/`,
          },
          { "@type": "ListItem", position: 3, name: cs.title },
        ],
      },
    ],
  };

  return (
    <main className="mx-auto max-w-4xl px-5 py-12 sm:px-10 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="tag mb-10">
        <Link
          href="/work/"
          className="text-muted transition-colors hover:text-fg"
        >
          ← Work
        </Link>
      </nav>

      <article>
        <p className="tag text-amber">{cs.eyebrow}</p>
        <h1 className="display mt-4 text-4xl text-fg sm:text-6xl">
          {cs.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          {cs.summary}
        </p>
        <ul
          aria-label="Stack"
          className="mt-7 flex flex-wrap gap-2 border-y border-line/70 py-4"
        >
          {cs.stack.map((s) => (
            <li key={s} className="chip">
              {s}
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-12 max-w-md">
          <CaseFigure slug={cs.slug} />
        </div>

        <Zone label="Problem">
          <div className="max-w-2xl space-y-4 leading-relaxed text-fg">
            {cs.problem.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </div>
        </Zone>

        <Zone label="Constraints">
          <ul className="acks max-w-2xl space-y-4">
            {cs.constraints.map((c) => (
              <li key={c.slice(0, 32)} className="leading-relaxed text-fg">
                {c}
              </li>
            ))}
          </ul>
        </Zone>

        <Zone label="Architecture">
          <div className="max-w-2xl space-y-4 leading-relaxed text-fg">
            {cs.architecture.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </div>
        </Zone>

        <Zone label="Outcome">
          <ul className="acks max-w-2xl space-y-4">
            {cs.outcome.map((o) => (
              <li key={o.slice(0, 32)} className="leading-relaxed text-fg">
                {o}
              </li>
            ))}
          </ul>
        </Zone>
      </article>

      <nav
        aria-label="More case studies"
        className="mt-16 border-t border-line/70 pt-10"
      >
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2 className="text-xl font-bold text-fg">More work</h2>
          <Link href="/work/" className="tag text-amber">
            All case studies →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {next.map((o, i) => (
            <WorkCard key={o.slug} cs={o} seed={i + 1} stub={false} />
          ))}
        </div>
      </nav>
    </main>
  );
}
