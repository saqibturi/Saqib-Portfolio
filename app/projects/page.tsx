import { getProjects, getProfile } from "@/lib/data";
import { ProjectList } from "@/components/project-list";
import { ContactCTA } from "@/components/public";
export async function generateMetadata() {
  const p = await getProfile();
  return { ...p.pageSeo.projects, alternates: { canonical: "/projects" } };
}
export default async function Projects() {
  return (
    <>
      <section className="container page-section">
        <p className="eyebrow">THE WORK</p>
        <h1>
          Built with <span className="headline-accent">purpose.</span>
        </h1>
        <p className="lead">
          A closer look at the problems, process, and thinking behind my
          projects.
        </p>
        <ProjectList projects={await getProjects()} />
      </section>
      <ContactCTA />
    </>
  );
}
