import { notFound, permanentRedirect } from "next/navigation";
import { getProjects } from "@/lib/data";
import { configured, publicClient } from "@/lib/supabase";
import { CaseStudy, ProjectCard } from "@/components/public";
import { siteUrl } from "@/lib/profile";
async function resolve(slug: string) {
  const projects = await getProjects();
  const project = projects.find((p) => p.slug === slug);
  if (project) return { project, projects };
  if (configured()) {
    const { data } = await publicClient()
      .from("project_slugs")
      .select("project_id")
      .eq("slug", slug)
      .maybeSingle();
    const target = projects.find((p) => p.id === data?.project_id);
    if (target) permanentRedirect(`/projects/${target.slug}`);
  }
  notFound();
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { project: p } = await resolve((await params).slug);
  return {
    title: p.title,
    description: p.summary,
    alternates: { canonical: `/projects/${p.slug}` },
    openGraph: {
      title: p.title,
      description: p.summary,
      ...(p.cover ? { images: [p.cover] } : {}),
    },
  };
}
export default async function Detail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { project: p, projects } = await resolve((await params).slug);
  const related = projects
    .filter((x) => x.id !== p.id && x.category === p.category)
    .slice(0, 2);
  return (
    <>
      <CaseStudy project={p} />
      {related.length > 0 && (
        <section className="container section">
          <h2>Related projects</h2>
          <div className="project-grid">
            {related.map((x) => (
              <ProjectCard key={x.id} project={x} />
            ))}
          </div>
        </section>
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: p.title,
            description: p.summary,
            url: `${siteUrl()}/projects/${p.slug}`,
          }).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
