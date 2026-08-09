import { site } from "@/data/site";
import { caseStudies } from "@/data/work";

export const dynamic = "force-static";

export default function sitemap() {
  const routes = [
    { path: "/", priority: 1.0, changeFrequency: "monthly" },
    { path: "/work/", priority: 0.9, changeFrequency: "monthly" },
    ...caseStudies.map((cs) => ({
      path: `/work/${cs.slug}/`,
      priority: 0.8,
      changeFrequency: "yearly",
    })),
    { path: "/publications/", priority: 0.9, changeFrequency: "monthly" },
    { path: "/press/", priority: 0.7, changeFrequency: "yearly" },
  ];
  const lastModified = new Date();
  return routes.map((r) => ({
    url: `${site.url}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
