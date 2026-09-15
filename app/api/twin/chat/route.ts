import { NextResponse } from "next/server";
import { z } from "zod";
import { answerTwinQuestion } from "@/lib/ai/twin";
import { jsonBody, rateLimit, sameOrigin } from "@/lib/security";

export const runtime = "nodejs";

const schema = z.object({
  sessionId: z.string().uuid(),
  question: z.string().trim().min(2).max(2000),
});

export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }
    if (!(await rateLimit(request, "digital-twin-chat", 40))) {
      return NextResponse.json({ error: "Chat limit reached. Try again later." }, { status: 429 });
    }
    const body = schema.parse(await jsonBody(request, 12000));
    const result = await answerTwinQuestion(body);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to answer right now";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
