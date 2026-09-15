import { NextResponse } from "next/server";
import { z } from "zod";
import { evaluateCandidate } from "@/lib/ai/intelligence";
import { getTwinOwnerId } from "@/lib/ai/twin";
import { jsonBody, rateLimit, sameOrigin } from "@/lib/security";

export const runtime = "nodejs";

const schema = z.object({
  targetRole: z.string().trim().min(2).max(120).default("AI Engineer"),
});

export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }
    if (!(await rateLimit(request, "digital-twin-recruiter", 8))) {
      return NextResponse.json({ error: "Recruiter Mode limit reached. Try again later." }, { status: 429 });
    }
    const body = schema.parse(await jsonBody(request, 4000));
    const ownerId = await getTwinOwnerId();
    const result = await evaluateCandidate({ ownerId, targetRole: body.targetRole });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to evaluate candidate" },
      { status: 400 },
    );
  }
}
