import { skills } from "@/data/site";

/* Skills set as a bill of materials: a reference designator per domain,
   the parts as chips, and a quantity column — the drawing's parts list. */
export default function SkillsSection() {
  const cols =
    "grid-cols-[2.6rem_1fr_auto] sm:grid-cols-[3.2rem_11rem_1fr_3rem]";
  return (
    <ol className="bom border-t border-line/70">
      <li
        aria-hidden="true"
        className={`tag hidden gap-x-5 border-b border-line/70 py-2.5 text-muted sm:grid ${cols}`}
      >
        <span>Ref</span>
        <span>Domain</span>
        <span>Parts</span>
        <span className="text-right">Qty</span>
      </li>
      {skills.map((group, i) => (
        <li
          key={group.domain}
          className={`grid items-start gap-x-5 gap-y-3 border-b border-line/70 py-5 ${cols}`}
        >
          <span className="tag pt-1 text-amber">U{i + 1}</span>
          <h3 className="pt-0.5 text-base font-semibold leading-snug text-fg">
            {group.domain}
          </h3>
          <span className="tag pt-1 text-right text-muted tabular-nums sm:order-last">
            {String(group.items.length).padStart(2, "0")}
          </span>
          <ul className="col-span-full flex flex-wrap gap-1.5 sm:col-span-1 sm:col-start-3">
            {group.items.map((item) => (
              <li key={item} className="chip">
                {item}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
