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

function Block({ label, children }) {
  return (
    <section className="mt-12">
      <h2 className="readout mb-5 flex items-center gap-3 text-muted">
        <span className="inline-block h-px w-8 bg-line" aria-hidden="true" />
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
    <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="readout mb-10">
        <Link href="/work/" className="text-muted transition-colors hover:text-ink">
          ← Work
        </Link>
      </nav>

      <p className="readout text-amber">{cs.eyebrow}</p>
      <h1 className="display mt-3 text-3xl font-bold leading-tight sm:text-4xl">
        {cs.title}
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-muted">{cs.summary}</p>
      <p className="readout mt-6 text-muted">{cs.stack.join(" · ")}</p>

      <Block label="Problem">
        <div className="space-y-4 leading-relaxed">
          {cs.problem.map((p) => (
            <p key={p.slice(0, 32)}>{p}</p>
          ))}
        </div>
      </Block>

      <Block label="Constraints">
        <ul className="space-y-3">
          {cs.constraints.map((c) => (
            <li key={c.slice(0, 32)} className="flex gap-3 leading-relaxed">
              <span className="readout mt-1.5 shrink-0 text-amber" aria-hidden="true">
                ▪
              </span>
              {c}
            </li>
          ))}
        </ul>
      </Block>

      <Block label="Architecture">
        <div className="space-y-4 leading-relaxed">
          {cs.architecture.map((p) => (
            <p key={p.slice(0, 32)}>{p}</p>
          ))}
        </div>
      </Block>

      <Block label="Outcome">
        <ul className="space-y-3">
          {cs.outcome.map((o) => (
            <li key={o.slice(0, 32)} className="flex gap-3 leading-relaxed">
              <span className="readout mt-1.5 shrink-0 text-accent" aria-hidden="true">
                ▪
              </span>
              <span className={o.startsWith("TODO:") ? "text-muted italic" : ""}>
                {o}
              </span>
            </li>
          ))}
        </ul>
      </Block>

      <nav aria-label="More case studies" className="mt-16 border-t border-line pt-10">
        <h2 className="readout mb-5 text-muted">More work</h2>
        <ul className="space-y-3">
          {others.map((o) => (
            <li key={o.slug}>
              <Link
                href={`/work/${o.slug}/`}
                className="font-medium underline decoration-line underline-offset-4 transition-colors hover:decoration-accent"
              >
                {o.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
