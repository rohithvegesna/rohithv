import WorkCard from "@/components/WorkCard";
import { caseStudies } from "@/data/work";

/* Case studies as branches routed off the spine. */
export default function WorkGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {caseStudies.map((cs, i) => (
        <WorkCard key={cs.slug} cs={cs} seed={i} />
      ))}
    </div>
  );
}
