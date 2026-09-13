import { NextResponse } from "next/server";
import { sessionClient } from "@/lib/supabase";
import { siteUrl } from "@/lib/profile";
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");
  if (code) {
    const { error } = await (
      await sessionClient()
    ).auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${siteUrl()}/auth/reset`);
  }
  return NextResponse.redirect(`${siteUrl()}/login?error=recovery`);
}
