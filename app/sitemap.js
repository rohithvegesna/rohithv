import { site } from "@/data/site";
import { caseStudies } from "@/data/work";

export const dynamic = "force-static";

export default function sitemap() {
  const routes = [
    { path: "/", priority: 1.0 },
    { path: "/work/", priority: 0.9 },
    ...caseStudies.map((cs) => ({ path: `/work/${cs.slug}/`, priority: 0.8 })),
    { path: "/publications/", priority: 0.9 },
    { path: "/press/", priority: 0.7 },
  ];
  const lastModified = new Date();
  return routes.map((r) => ({
    url: `${site.url}${r.path}`,
    lastModified,
    priority: r.priority,
  }));
}
