import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation";
import { configured, serviceClient } from "@/lib/supabase";
import { sameOrigin, rateLimit, jsonBody } from "@/lib/security";
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Request not allowed." },
      { status: 403 },
    );
  if (!configured())
    return NextResponse.json(
      {
        error:
          "The contact form is not connected yet. Please email contact.saqibmuhammad@gmail.com directly.",
      },
      { status: 503 },
    );
  try {
    const parsed = contactSchema.safeParse(await jsonBody(request, 12000));
    if (!parsed.success)
      return NextResponse.json(
        {
          error: parsed.error.issues
            .map((x) => `${x.path.join(".")}: ${x.message}`)
            .join("; "),
        },
        { status: 400 },
      );
    const d = parsed.data;
    if (d.website)
      return NextResponse.json(
        { error: "Unable to accept this submission." },
        { status: 400 },
      );
    if (!(await rateLimit(request, "contact", 5)))
      return NextResponse.json(
        {
          error:
            "Too many messages. Please try again in an hour or email me directly.",
        },
        { status: 429 },
      );
    const { error } = await serviceClient().from("messages").insert({
      id: d.submissionId,
      name: d.name,
      email: d.email,
      company: d.company,
      type: d.type,
      message: d.message,
    });
    if (error && error.code !== "23505")
      return NextResponse.json(
        {
          error:
            "Your message was not saved. Please try again or email me directly.",
        },
        { status: 503 },
      );
    if (!error && process.env.RESEND_API_KEY && process.env.NOTIFICATION_FROM) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.NOTIFICATION_FROM,
            to: [
              process.env.NOTIFICATION_TO || "contact.saqibmuhammad@gmail.com",
            ],
            subject: "New portfolio enquiry",
            text: "A new enquiry is saved in your portfolio inbox. Sign in to review it.",
          }),
          signal: AbortSignal.timeout(5000),
        });
      } catch {
        /* Message is already safely stored. */
      }
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to send right now. Please email me directly." },
      { status: 503 },
    );
  }
}
