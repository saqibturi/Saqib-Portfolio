import Link from "next/link";
import { redirect } from "next/navigation";
import { owner } from "@/lib/supabase";
import { AdminTwin } from "@/components/admin-twin";
import { Logout } from "@/components/logout";

export const metadata = {
  title: "AI Digital Twin workspace",
  robots: { index: false, follow: false },
};

export default async function AdminTwinPage() {
  if (!(await owner())) redirect("/login?next=/admin/twin");
  return (
    <div className="container admin-shell">
      <aside className="admin-nav" aria-label="Admin navigation">
        <Link href="/admin">Overview</Link>
        <Link href="/admin/projects">Projects</Link>
        <Link href="/admin/profile">Profile</Link>
        <Link href="/admin/certifications">Certifications</Link>
        <Link className="active" href="/admin/twin">AI Twin</Link>
        <Link href="/admin/inbox">Inbox</Link>
        <Link href="/admin/media">Media</Link>
        <Logout />
      </aside>
      <section className="admin-main">
        <AdminTwin />
      </section>
    </div>
  );
}
