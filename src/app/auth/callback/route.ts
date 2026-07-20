import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase SSR code exchange for PKCE / email redirectTo flows.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[Auth Callback]", error.message);
      return NextResponse.redirect(`${origin}/sign-in?error=auth-callback-error`);
    }

    const destination = next.startsWith("/") ? next : "/dashboard";
    return NextResponse.redirect(`${origin}${destination}`);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
