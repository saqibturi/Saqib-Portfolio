import { NextResponse } from "next/server";
import { z } from "zod";
import { answerTwinQuestion } from "@/lib/ai/twin";

export const runtime = "nodejs";

const schema = z.object({
  sessionId: z.string().uuid(),
  question: z.string().trim().min(2).max(2000),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const result = await answerTwinQuestion(body);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to answer right now";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
