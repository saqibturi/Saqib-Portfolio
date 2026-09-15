import "server-only";
import { createHmac } from "node:crypto";
import { siteUrl } from "./profile";
import { serviceClient } from "./supabase";

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    // Relative browser requests should match the deployment that actually
    // received the request. This keeps production and Vercel previews working
    // without weakening the same-origin protection.
    if (origin === new URL(request.url).origin) return true;

    // Fallback for deployments behind a proxy that rewrites request.url.
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
