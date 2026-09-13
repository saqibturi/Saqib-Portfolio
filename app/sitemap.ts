export const dynamic = "force-dynamic";
import { getProjects } from "@/lib/data";
import { siteUrl } from "@/lib/profile";
export default async function sitemap() {
  return [
    ...["", "/projects", "/about", "/contact", "/certifications"],
    ...(await getProjects()).map((p) => `/projects/${p.slug}`),
  ].map((path) => ({ url: siteUrl() + path }));
}
