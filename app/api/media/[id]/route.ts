import { owner, configured, serviceClient } from "@/lib/supabase";
import { canReadMedia } from "@/lib/validation";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!configured() || !/^[a-f0-9-]{36}$/.test(id))
    return new Response("Not found", { status: 404 });
  try {
    const db = serviceClient();
    const [profile, projects, certificates] = await Promise.all([
      db.from("profile").select("content"),
      db.from("published_projects").select("content"),
      db.from("published_certificates").select("content"),
    ]);
    if (
      profile.error ||
      projects.error ||
      (certificates.error &&
        !["42P01", "PGRST205"].includes(certificates.error.code))
    )
      return new Response("Unavailable", { status: 503 });
    if (
      !canReadMedia(id, [
        ...profile.data,
        ...projects.data,
        ...(certificates.data || []),
      ]) &&
      !(await owner())
    )
      return new Response("Not found", { status: 404 });
    const { data: m, error } = await db
      .from("media")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !m) return new Response("Not found", { status: 404 });
    const result = await db.storage.from("portfolio-media").download(m.path);
    if (result.error) return new Response("Unavailable", { status: 503 });
    return new Response(result.data, {
      headers: {
        "Content-Type": m.mime,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        ...(m.mime === "application/pdf"
          ? { "Content-Disposition": 'attachment; filename="document.pdf"' }
          : {}),
      },
    });
  } catch {
    return new Response("Unavailable", { status: 503 });
  }
}
