import Link from "next/link";
import { CertificateManager } from "@/components/admin-certificates";
import { redirect, notFound } from "next/navigation";
import { owner, serviceClient } from "@/lib/supabase";
import { getProfile } from "@/lib/data";
import { ProjectEditor } from "@/components/admin-project";
import { ProfileEditor } from "@/components/admin-profile";
import { Inbox } from "@/components/admin-inbox";
import { MediaManager } from "@/components/admin-media";
import { CaseStudy } from "@/components/public";
import { Logout } from "@/components/logout";
export const metadata = {
  title: "Portfolio admin",
  robots: { index: false, follow: false },
};
export default async function Admin({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}) {
  if (!(await owner())) redirect("/login");
  const path = (await params).section || [];
  const page = path[0] || "dashboard";
  const db = serviceClient();
  if (page === "preview" && path[1]) {
    const { data, error } = await db
      .from("project_drafts")
      .select("content")
      .eq("id", path[1])
      .single();
    if (error || !data) notFound();
    return (
      <>
        <div className="container notice">
          Private preview · This is your saved draft. It is not visible to
          visitors.
        </div>
        <CaseStudy project={data.content} />
      </>
    );
  }
  let content;
  if (page === "dashboard") {
    const [published, drafts, unread, recent] = await Promise.all([
      db.from("published_projects").select("*", { count: "exact", head: true }),
      db.from("project_drafts").select("*", { count: "exact", head: true }),
      db
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("status", "unread"),
      db
        .from("messages")
        .select("id,name,type,created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);
    if (published.error || drafts.error || unread.error || recent.error)
      throw new Error("Dashboard unavailable");
    content = (
      <>
        <div className="admin-heading">
          <h1>Your workspace.</h1>
          <Link className="button" href="/admin/projects/new">
            New project +
          </Link>
        </div>
        <div className="stats">
          <div className="stat">
            Published projects<strong>{published.count}</strong>
          </div>
          <div className="stat">
            Saved drafts<strong>{drafts.count}</strong>
          </div>
          <div className="stat">
            Unread messages<strong>{unread.count}</strong>
          </div>
        </div>
        <div className="panel">
          <h2>Recent enquiries</h2>
          {recent.data?.length ? (
            recent.data.map((m) => (
              <Link className="list-row" key={m.id} href="/admin/inbox">
                <div>
                  <h3>{m.name}</h3>
                  <p>{m.type}</p>
                </div>
                <small>{new Date(m.created_at).toLocaleDateString()}</small>
              </Link>
            ))
          ) : (
            <p>No enquiries yet.</p>
          )}
        </div>
        <div className="actions">
          <Link className="button secondary" href="/admin/profile">
            Edit your profile
          </Link>
          <Link className="button secondary" href="/admin/media">
            Manage media
          </Link>
          <Link className="button secondary" href="/" target="_blank">
            View portfolio ↗
          </Link>
        </div>
      </>
    );
  } else if (page === "projects" && path[1] === "new") {
    content = <ProjectEditor />;
  } else if (page === "projects" && path[1]) {
    const [draft, published] = await Promise.all([
      db.from("project_drafts").select("content").eq("id", path[1]).single(),
      db
        .from("published_projects")
        .select("id")
        .eq("id", path[1])
        .maybeSingle(),
    ]);
    if (draft.error || !draft.data) notFound();
    content = (
      <ProjectEditor
        initial={draft.data.content}
        published={Boolean(published.data)}
      />
    );
  } else if (page === "projects") {
    const [drafts, pub] = await Promise.all([
      db
        .from("project_drafts")
        .select("id,content,updated_at")
        .order("updated_at", { ascending: false }),
      db.from("published_projects").select("id"),
    ]);
    if (drafts.error || pub.error) throw new Error("Projects unavailable");
    content = (
      <>
        <div className="admin-heading">
          <h1>Projects</h1>
          <Link className="button" href="/admin/projects/new">
            New project +
          </Link>
        </div>
        <p>
          Save drafts freely. Publish only when you’re ready to update the live
          site.
        </p>
        {drafts.data?.length ? (
          drafts.data.map((d) => (
            <Link
              key={d.id}
              className="list-row"
              href={`/admin/projects/${d.id}`}
            >
              <div>
                <h3>{d.content.title}</h3>
                <p>
                  {d.content.category} · Updated{" "}
                  {new Date(d.updated_at).toLocaleDateString()}
                </p>
              </div>
              <span className="tags">
                <span>
                  {pub.data?.some((p) => p.id === d.id)
                    ? "Published + saved draft"
                    : "Draft"}
                </span>
              </span>
            </Link>
          ))
        ) : (
          <div className="panel">
            <h2>Your first case study starts here.</h2>
            <p>
              Add a real project, describe your contribution, and save it as a
              draft.
            </p>
          </div>
        )}
      </>
    );
  } else if (page === "profile")
    content = <ProfileEditor initial={await getProfile()} />;
  else if (page === "certifications") {
    const [drafts, published] = await Promise.all([
      db
        .from("certificate_drafts")
        .select("content")
        .order("updated_at", { ascending: false }),
      db.from("published_certificates").select("id"),
    ]);
    content =
      drafts.error || published.error ? (
        <div className="panel">
          <h1>Enable certifications</h1>
          <p>
            Run the included 002_certifications.sql migration in Supabase SQL
            Editor, then reload this page. Your existing data is preserved.
          </p>
        </div>
      ) : (
        <CertificateManager
          drafts={drafts.data.map((x) => x.content)}
          publishedIds={published.data.map((x) => x.id)}
        />
      );
  } else if (page === "inbox") content = <Inbox />;
  else if (page === "media") {
    const { data, error } = await db
      .from("media")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error("Media unavailable");
    content = <MediaManager items={data} />;
  } else notFound();
  return (
    <div className="container admin-shell">
      <aside className="admin-nav" aria-label="Admin navigation">
        {[
          ["dashboard", "Overview"],
          ["projects", "Projects"],
          ["profile", "Profile"],
          ["certifications", "Certifications"],
          ["inbox", "Inbox"],
          ["media", "Media"],
        ].map(([key, label]) => (
          <Link
            className={page === key ? "active" : ""}
            key={key}
            href={key === "dashboard" ? "/admin" : `/admin/${key}`}
          >
            {label}
          </Link>
        ))}
        <Logout />
      </aside>
      <section className="admin-main">{content}</section>
    </div>
  );
}
