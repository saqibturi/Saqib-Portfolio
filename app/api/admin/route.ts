import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  configured,
  owner,
  sessionClient,
  serviceClient,
} from "@/lib/supabase";
import { sameOrigin, jsonBody } from "@/lib/security";
import {
  projectSchema,
  certificateSchema,
  profileSchema,
  csvCell,
  canReadMedia,
} from "@/lib/validation";
import { z } from "zod";
export async function GET(request: Request) {
  if (!(await owner()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = serviceClient();
  const url = new URL(request.url);
  const resource = url.searchParams.get("resource");
  if (resource === "messages") {
    const page = Math.max(0, Number(url.searchParams.get("page")) || 0);
    const status = url.searchParams.get("status");
    const q = (url.searchParams.get("q") || "")
      .slice(0, 100)
      .replace(/[^\p{L}\p{N}\s@._-]/gu, "");
    let query = db
      .from("messages")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });
    if (status && status !== "all") query = query.eq("status", status);
    if (q)
      query = query.or(
        `name.ilike.%${q}%,email.ilike.%${q}%,message.ilike.%${q}%`,
      );
    const { data, error, count } = await query.range(page * 20, page * 20 + 19);
    if (error)
      return NextResponse.json(
        { error: "Unable to load messages" },
        { status: 503 },
      );
    return NextResponse.json({ data, count });
  }
  if (resource === "export") {
    let all: Record<string, unknown>[] = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await db
        .from("messages")
        .select("*")
        .order("created_at")
        .range(from, from + 999);
      if (error)
        return NextResponse.json({ error: "Export failed" }, { status: 503 });
      all = all.concat(data);
      if (data.length < 1000) break;
    }
    const cols = [
      "name",
      "email",
      "company",
      "type",
      "message",
      "status",
      "created_at",
    ];
    return new Response(
      [
        cols.join(","),
        ...all.map((r) => cols.map((c) => csvCell(r[c])).join(",")),
      ].join("\r\n"),
      {
        headers: {
          "Content-Type": "text/csv;charset=utf-8",
          "Content-Disposition":
            'attachment; filename="portfolio-enquiries.csv"',
          "Cache-Control": "no-store",
        },
      },
    );
  }
  return NextResponse.json({ error: "Unknown resource" }, { status: 400 });
}
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: "Request not allowed" }, { status: 403 });
  if (!configured())
    return NextResponse.json(
      { error: "Connect Supabase to enable the admin panel." },
      { status: 503 },
    );
  try {
    const body = await jsonBody(request);
    if (!(await owner()))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const db = serviceClient();
    let error;
    switch (body.action) {
      case "logout": {
        await (await sessionClient()).auth.signOut();
        return NextResponse.json({ ok: true });
      }
      case "save-certificate": {
        const c = certificateSchema.parse(body.certificate);
        ({ error } = await db
          .from("certificate_drafts")
          .upsert({
            id: c.id,
            content: c,
            updated_at: new Date().toISOString(),
          }));
        break;
      }
      case "publish-certificate": {
        const id = z.uuid().parse(body.id);
        const { data: row, error: readError } = await db
          .from("certificate_drafts")
          .select("content")
          .eq("id", id)
          .single();
        if (readError) throw new Error("Save the certificate draft first.");
        const c = certificateSchema.parse(row.content);
        if (!c.file && !c.verificationUrl)
          throw new Error(
            "Upload a certificate file or add a verification URL before publishing.",
          );
        if (c.thumbnail && !c.alt)
          throw new Error("Add alt text for the card image.");
        ({ error } = await db
          .from("published_certificates")
          .upsert({
            id: c.id,
            content: c,
            published_at: new Date().toISOString(),
          }));
        break;
      }
      case "unpublish-certificate":
        ({ error } = await db
          .from("published_certificates")
          .delete()
          .eq("id", z.uuid().parse(body.id)));
        break;
      case "delete-certificate":
        ({ error } = await db
          .from("certificate_drafts")
          .delete()
          .eq("id", z.uuid().parse(body.id)));
        break;
      case "save-project": {
        const p = projectSchema.parse(body.project);
        ({ error } = await db.from("project_drafts").upsert({
          id: p.id,
          content: p,
          updated_at: new Date().toISOString(),
        }));
        break;
      }
      case "publish": {
        const id = z.uuid().parse(body.id);
        const { data: row, error: e } = await db
          .from("project_drafts")
          .select("content")
          .eq("id", id)
          .single();
        if (e) throw new Error("Draft not found");
        const p = projectSchema.parse(row.content);
        if (!p.summary || !p.problem || !p.approach)
          throw new Error(
            "Add a summary, problem, and approach before publishing.",
          );
        if (p.cover && !p.coverAlt)
          throw new Error("Add cover image alt text.");
        if (p.gallery.some((g) => !g.alt))
          throw new Error("Add alt text to every gallery image.");
        ({ error } = await db.rpc("publish_project", { p_id: id }));
        break;
      }
      case "unpublish":
        ({ error } = await db
          .from("published_projects")
          .delete()
          .eq("id", z.uuid().parse(body.id)));
        break;
      case "delete-project":
        ({ error } = await db
          .from("project_drafts")
          .delete()
          .eq("id", z.uuid().parse(body.id)));
        break;
      case "profile":
        ({ error } = await db.from("profile").upsert({
          id: 1,
          content: profileSchema.parse(body.profile),
          updated_at: new Date().toISOString(),
        }));
        break;
      case "message-status":
        ({ error } = await db
          .from("messages")
          .update({
            status: z
              .enum(["unread", "read", "replied", "archived"])
              .parse(body.status),
          })
          .eq("id", z.uuid().parse(body.id)));
        break;
      case "delete-message":
        ({ error } = await db
          .from("messages")
          .delete()
          .eq("id", z.uuid().parse(body.id)));
        break;
      case "delete-media": {
        const id = z.uuid().parse(body.id);
        const [profile, drafts, published, certificateDrafts, certificates] =
          await Promise.all([
            db.from("profile").select("content"),
            db.from("project_drafts").select("content"),
            db.from("published_projects").select("content"),
            db.from("certificate_drafts").select("content"),
            db.from("published_certificates").select("content"),
          ]);
        if (
          profile.error ||
          drafts.error ||
          published.error ||
          certificateDrafts.error ||
          certificates.error
        )
          throw new Error("Could not check file references");
        if (
          canReadMedia(id, [...profile.data, ...drafts.data, ...published.data, ...certificateDrafts.data, ...certificates.data])
        )
          throw new Error(
            "This file is still used by content. Remove its references first.",
          );
        const { data: m } = await db
          .from("media")
          .select("path")
          .eq("id", id)
          .single();
        if (m) {
          const result = await db.storage
            .from("portfolio-media")
            .remove([m.path]);
          if (result.error) throw new Error("Could not remove the file");
          ({ error } = await db.from("media").delete().eq("id", id));
        }
        break;
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
    if (error)
      throw new Error(
        error.code === "23505"
          ? "This URL is already used by another project. Choose another slug."
          : "Could not save. Please try again.",
      );
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof z.ZodError
            ? err.issues
                .map((i) => `${i.path.join(".")}: ${i.message}`)
                .join("; ")
            : err instanceof Error
              ? err.message
              : "Operation failed",
      },
      { status: 400 },
    );
  }
}
