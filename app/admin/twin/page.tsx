import { redirect } from "next/navigation";
import { owner } from "@/lib/supabase";
import { AdminTwin } from "@/components/admin-twin";

export default async function AdminTwinPage() {
  if (!(await owner())) redirect("/login?next=/admin/twin");
  return <AdminTwin />;
}
