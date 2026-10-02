import { press } from "@/data/press";

export default function PressList({ HeadingTag = "h2" }) {
  return (
    <ul className="space-y-0">
      {press.map((item) => (
        <li
          key={item.link}
          className="border-t border-line/70 py-8 last:border-b"
        >
          <p className="tag flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-amber">{item.date}</span>
            <span aria-hidden="true" className="text-line">
              ·
            </span>
            <span className="chip">{item.outlet}</span>
          </p>
          <HeadingTag className="mt-4 text-xl font-bold leading-snug">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="u-link"
            >
              {item.title}
            </a>
          </HeadingTag>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            {item.description}
          </p>
        </li>
      ))}
    </ul>
  );
}
