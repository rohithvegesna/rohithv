import { skills } from "@/data/site";

export default function SkillsSection() {
  return (
    <dl className="grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
      {skills.map((group) => (
        <div key={group.domain}>
          <dt className="sign-label mb-3 text-green">{group.domain}</dt>
          <dd className="text-sm leading-7 text-steel">
            {group.items.join(" · ")}
          </dd>
        </div>
      ))}
    </dl>
  );
}
