import { NextResponse } from "next/server";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import { owner, serviceClient } from "@/lib/supabase";
import { sameOrigin } from "@/lib/security";
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: "Request not allowed" }, { status: 403 });
  if (!(await owner()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    if (Number(request.headers.get("content-length") || 0) > 4_000_000)
      throw new Error("Files must be under 3 MB.");
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size > 3_000_000 || !file.size)
      throw new Error("Choose a file under 3 MB.");
    let bytes = Buffer.from(await file.arrayBuffer());
    let mime = "image/webp",
      extension = "webp";
    if (file.type === "application/pdf") {
      if (bytes.subarray(0, 5).toString() !== "%PDF-")
        throw new Error("Invalid PDF.");
      await PDFDocument.load(bytes, { ignoreEncryption: false });
      mime = "application/pdf";
      extension = "pdf";
    } else {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
        throw new Error("Upload a JPG, PNG, WebP, or PDF.");
      const image = sharp(bytes, { limitInputPixels: 25_000_000 });
      const info = await image.metadata();
      if (!["jpeg", "png", "webp"].includes(info.format || ""))
        throw new Error("Invalid image.");
      bytes = Buffer.from(
        await image
          .rotate()
          .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 85 })
          .toBuffer(),
      );
    }
    const id = crypto.randomUUID(),
      path = `${id}.${extension}`;
    const db = serviceClient();
    const { error } = await db.storage
      .from("portfolio-media")
      .upload(path, bytes, { contentType: mime, upsert: false });
    if (error) throw new Error("Upload failed. Please try again.");
    const { error: rowError } = await db.from("media").insert({
      id,
      path,
      mime,
      name: file.name.slice(0, 200),
      size: bytes.length,
    });
    if (rowError) {
      await db.storage.from("portfolio-media").remove([path]);
      throw new Error("Could not save the file record.");
    }
    return NextResponse.json({ url: `/api/media/${id}`, id, mime });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 400 },
    );
  }
}
