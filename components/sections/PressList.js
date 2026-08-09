import { press } from "@/data/press";

export default function PressList({ HeadingTag = "h2" }) {
  return (
    <ul className="space-y-0">
      {press.map((item) => (
        <li
          key={item.link}
          className="border-t border-line/70 py-8 last:border-b"
        >
          <p className="tag text-amber">{item.date}</p>
          <HeadingTag className="mt-3 text-xl font-bold leading-snug">
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
