import { experience, education } from "@/data/site";

export default function ExperienceSection() {
  return (
    <>
      <ol className="space-y-14">
        {experience.map((company) => (
          <li key={company.org}>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h3 className="text-2xl font-bold text-ink">{company.org}</h3>
              <p className="sign-label text-steel">{company.place}</p>
            </div>
            <ol className="mt-6 space-y-10 border-l-2 border-green/40 pl-7 sm:pl-9">
              {company.roles.map((role) => (
                <li key={role.period} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[34px] top-1 h-3 w-3 rounded-full border-[3px] border-green bg-cream sm:-left-[42px]"
                  />
                  <p className="sign-label text-green">{role.period}</p>
                  <h4 className="mt-1.5 text-lg font-bold text-ink">
                    {role.title}
                  </h4>
                  <p className="mt-2.5 max-w-2xl leading-relaxed text-steel">
                    {role.body}
                  </p>
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ol>
      <h3 className="mb-6 mt-16 text-xl font-bold text-ink">Education</h3>
      <ul className="space-y-3">
        {education.map((ed) => (
          <li
            key={ed.title}
            className="flex flex-wrap items-baseline gap-x-4 gap-y-1"
          >
            <span className="sign-label text-green">{ed.period}</span>
            <span className="font-bold text-ink">{ed.title}</span>
            <span className="text-sm text-steel">
              {ed.org}, {ed.place}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
