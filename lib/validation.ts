import { z } from "zod";
const text = (n = 500) => z.string().trim().max(n);
const link = z
  .string()
  .max(2048)
  .refine((v) => !v || /^https:\/\//.test(v), "Use a full HTTPS URL");
const asset = z
  .string()
  .max(300)
  .refine(
    (v) =>
      !v || v === "/portrait.webp" || /^\/api\/media\/[a-f0-9-]{36}$/.test(v),
    "Use an uploaded file",
  );
export const projectSchema = z.object({
  id: z.string().uuid(),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(100),
  title: text(120).min(1),
  summary: text(500),
  category: text(80).min(1),
  tags: z.array(text(50)).max(20),
  cover: asset,
  coverAlt: text(300),
  gallery: z
    .array(z.object({ url: asset, alt: text(300), caption: text(500) }))
    .max(20),
  role: text(200),
  timeline: text(100),
  github: link,
  demo: link,
  featured: z.boolean(),
  order: z.number().int().min(0).max(10000),
  problem: text(15000),
  approach: text(15000),
  data: text(15000),
  implementation: text(15000),
  evaluation: text(15000),
  limitations: text(15000),
  outcomes: text(15000),
});
const timeline = z.object({
  title: text(200),
  organization: text(200),
  period: text(100),
  description: text(2000),
});
export const profileSchema = z.object({
  name: text(100).min(1),
  title: text(200),
  heroHeadline: text(100),
  heroAccent: text(100),
  intro: text(1000),
  about: text(10000),
  email: z.email(),
  phone: z.string().regex(/^\+?[\d\s()-]{7,25}$/),
  location: text(100),
  availability: text(150),
  photo: asset,
  resume: asset,
  socials: z.array(z.object({ label: text(50), url: link })).max(10),
  expertise: z
    .array(
      z.object({
        title: text(100),
        description: text(1000),
        tags: z.array(text(50)).max(20),
      }),
    )
    .max(10),
  experience: z.array(timeline).max(20),
  education: z.array(timeline).max(20),
  sections: z
    .array(
      z.enum([
        "expertise",
        "projects",
        "about",
        "experience",
        "certifications",
      ]),
    )
    .max(5),
  seoTitle: text(120),
  seoDescription: text(300),
  ogImage: asset,
  pageSeo: z.record(
    z.string(),
    z.object({ title: text(120), description: text(300) }),
  ),
});
export const contactSchema = z.object({
  name: text(100).min(2),
  email: z.email().max(254),
  company: text(150),
  type: z.enum([
    "Project enquiry",
    "Job opportunity",
    "Collaboration",
    "Other",
  ]),
  message: text(5000).min(20),
  website: text(200),
  submissionId: z.string().uuid(),
});
export function csvCell(v: unknown) {
  const s = String(v ?? "");
  const safe = /^[\s]*[=+@\-\t\r]/.test(s) ? "'" + s : s;
  return '"' + safe.replaceAll('"', '""') + '"';
}
export function canReadMedia(id: string, documents: unknown[]) {
  return documents.some((d) => JSON.stringify(d).includes(`/api/media/${id}`));
}

const certificateDate = z
  .string()
  .refine(
    (v) =>
      !v || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))),
    "Use a valid date",
  );
export const certificateSchema = z.object({
  id: z.uuid(),
  title: text(200).min(1),
  issuer: text(200).min(1),
  issued: certificateDate,
  expires: certificateDate,
  credentialId: text(200),
  verificationUrl: link,
  description: text(5000),
  skills: z.array(text(60)).max(30),
  file: asset,
  thumbnail: asset,
  alt: text(300),
  order: z.number().int().min(0).max(10000),
});
