import { NextResponse } from "next/server";
import { z } from "zod";
import { evaluateCandidate } from "@/lib/ai/intelligence";
import { getTwinOwnerId } from "@/lib/ai/twin";

export const runtime = "nodejs";

const schema = z.object({
  targetRole: z.string().trim().min(2).max(120).default("AI Engineer"),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
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
