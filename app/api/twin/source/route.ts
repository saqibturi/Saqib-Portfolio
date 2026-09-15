import { NextResponse } from "next/server";
import { z } from "zod";
import { owner } from "@/lib/supabase";
import { upsertTwinSource } from "@/lib/ai/twin";

export const runtime = "nodejs";

const schema = z.object({
  sourceType: z.enum(["profile", "resume", "linkedin", "project", "note", "document", "custom"]),
  title: z.string().trim().min(2).max(180),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  rawContent: z.string().trim().min(40).max(200000),
});

export async function POST(request: Request) {
  const user = await owner();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = schema.parse(await request.json());
    const result = await upsertTwinSource({ ownerId: user.id, ...body, sourceUrl: body.sourceUrl || null });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to ingest source";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
