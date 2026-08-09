import { skills } from "@/data/site";

export default function SkillsSection() {
  return (
    <dl className="grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
      {skills.map((group) => (
        <div key={group.domain}>
          <dt className="tag mb-3 text-amber">{group.domain}</dt>
          <dd className="text-sm leading-7 text-muted">
            {group.items.join(" · ")}
          </dd>
        </div>
      ))}
    </dl>
  );
}
