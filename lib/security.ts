import "server-only";
import { createHmac } from "node:crypto";
import { siteUrl } from "./profile";
import { serviceClient } from "./supabase";

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    // Browser calls use a relative API URL, so the safest primary check is the
    // actual origin that received this request. This also makes Vercel preview
    // deployments work instead of incorrectly comparing every request against
    // the production NEXT_PUBLIC_SITE_URL.
    if (origin === new URL(request.url).origin) return true;

    // Keep the configured canonical site as a fallback for deployments sitting
    // behind a proxy where request.url may be rewritten internally.
    if (origin === new URL(siteUrl()).origin) return true;
  } catch {
    return false;
  }

  return false;
}

export async function rateLimit(request: Request, kind: string, limit: number) {
  if (!process.env.RATE_LIMIT_SECRET)
    throw new Error("Rate limiting unavailable");
  const ip = process.env.VERCEL
    ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0] || "unknown"
    : "local";
  const key = createHmac("sha256", process.env.RATE_LIMIT_SECRET)
    .update(`${kind}:${ip}`)
    .digest("hex");
  const { data, error } = await serviceClient().rpc("consume_rate_limit", {
    p_key: key,
    p_limit: limit,
  });
  if (error) throw new Error("Rate limiting unavailable");
  return data === true;
}

export async function jsonBody(request: Request, max = 150000) {
  if (Number(request.headers.get("content-length") || 0) > max)
    throw new Error("Request too large");
  const bytes = await request.arrayBuffer();
  if (bytes.byteLength > max) throw new Error("Request too large");
  return JSON.parse(new TextDecoder().decode(bytes));
}
