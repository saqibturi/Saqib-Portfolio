import { NextResponse } from "next/server";
import { z } from "zod";
import { configured, sessionClient, owner } from "@/lib/supabase";
import { sameOrigin, jsonBody, rateLimit } from "@/lib/security";
import { siteUrl } from "@/lib/profile";
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: "Request not allowed" }, { status: 403 });
  if (!configured())
    return NextResponse.json(
      {
        error:
          "Admin access requires the Supabase setup described in the owner guide.",
      },
      { status: 503 },
    );
  try {
    if (!(await rateLimit(request, "auth", 15)))
      return NextResponse.json(
        { error: "Too many attempts. Please try later." },
        { status: 429 },
      );
    const body = await jsonBody(request, 3000);
    const s = await sessionClient();
    if (body.action === "login") {
      const { email, password } = z
        .object({ email: z.email(), password: z.string().min(1).max(200) })
        .parse(body);
      const { error } = await s.auth.signInWithPassword({ email, password });
      if (error || !(await owner())) {
        await s.auth.signOut();
        return NextResponse.json(
          { error: "Invalid credentials or owner access not granted." },
          { status: 401 },
        );
      }
    } else if (body.action === "recover") {
      const email = z.email().parse(body.email);
      await s.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl()}/auth/callback`,
      });
    } else if (body.action === "reset") {
      if (!(await owner()))
        return NextResponse.json(
          { error: "Please open the recovery link from your email." },
          { status: 401 },
        );
      const password = z.string().min(12).max(200).parse(body.password);
      const { error } = await s.auth.updateUser({ password });
      if (error) throw error;
    } else
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        error:
          "Unable to complete this request. Check your details and try again.",
      },
      { status: 400 },
    );
  }
}
